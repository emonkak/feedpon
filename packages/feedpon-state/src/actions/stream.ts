import { Readability } from '@mozilla/readability';
import type { Reactive } from 'barebind/extras/reactive';
import type { AppAction, AppContext } from '../action.ts';
import type { ImmutableMap } from '../collections/ImmutableMap.ts';
import type {
  AppState,
  Entry,
  FullContent,
  Session,
  SessionSettings,
  Siteinfo,
  Stream,
} from '../state.ts';
import { absolutifyUrls } from '../utils/absolutifyUrls.ts';
import { decodeResponse } from '../utils/decodeResponse.ts';
import { acquireCredential } from './auth.ts';
import { sendNotification } from './ui.ts';

const STREAM_ID_PATTERN =
  /^(?<type>feed)\/(?<title>.*)|^user\/[^/]*\/(?<type>category|tag)\/(?<title>[^/]*)/;

const MAX_URL_LENGTH = 4096;

export function fetchFullContent(
  entryId: string,
): AppAction<Promise<void> | void> {
  return (context) => {
    const { state$ } = context;
    const siteinfos$ = state$.get('siteinfos');
    const siteinfosUpdated$ = state$.get('siteinfosUpdated');

    return findEntry(state$, entryId)?.mutate(async (entry) => {
      const url = entry.fullContents?.at(-1)?.url ?? entry.origin.htmlUrl;
      const response = await fetch(url, {
        credentials: 'include',
        mode: 'cors',
      });
      const content = await decodeResponse(response);
      const document = new DOMParser().parseFromString(content, 'text/html');

      absolutifyUrls(document, url);

      if (siteinfosUpdated$.value < 0) {
        updateSiteinfos()(context);
      }

      const fullContent =
        extractFullContentBySiteinfos(document, siteinfos$.value) ??
        extractFullContentByReadability(document);

      if (fullContent !== null) {
        entry.fullContents = (entry.fullContents ?? []).concat(fullContent);
      }
    });
  };
}

export function fetchHatenaBookmarkCounts(): AppAction<Promise<void>> {
  return async ({ hatenaBookmarkClient, state$ }) => {
    const items$ = state$.get('stream').get('items');
    if (items$ === null) {
      return;
    }

    const urls = [];

    for (const item of items$.value) {
      if (item.hatenaBookmarkCount === undefined) {
        urls.push(item.origin.htmlUrl);
      }
    }

    if (urls.length > 0) {
      const newItems = items$.value.slice();

      for (const chunkedUrls of splitStrings(urls, MAX_URL_LENGTH)) {
        const counts = await hatenaBookmarkClient.getMultipleBookmarkCounts({
          url: chunkedUrls,
        });

        for (let i = 0, l = newItems.length; i < l; i++) {
          const item = newItems[i]!;
          if (Object.hasOwn(counts, item.origin.htmlUrl)) {
            newItems[i] = {
              ...item,
              hatenaBookmarkCount: counts[item.origin.htmlUrl],
            };
          }
        }
      }

      items$.value = newItems;
    }
  };
}

export function fetchHatenaBookmarkEntry(
  entryId: string,
): AppAction<Promise<void> | void> {
  return ({ state$, hatenaBookmarkClient }) => {
    return findEntry(state$, entryId)?.mutate(async (entry) => {
      entry.hatenaBookmarkLoading = true;

      try {
        entry.hatenaBookmark = await hatenaBookmarkClient.getBookmarkEntry({
          uri: entry.origin.htmlUrl,
        });
      } finally {
        entry.hatenaBookmarkLoading = false;
      }
    });
  };
}

export function fetchStream(): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, persistentStore, state$ } = context;

    return state$.mutate(async (state) => {
      const { feed: oldFeed, session, stream: oldStream } = state;

      if (session === null) {
        return;
      }

      state.streamLoading = true;

      try {
        const credential = await acquireCredential(context);

        if (oldFeed === null && isFeedId(session.id)) {
          let newFeed = await persistentStore.findFeed(session.id);

          if (newFeed === null) {
            newFeed = await feedlyClient.getFeed(
              credential.accessToken,
              session.id,
            );
          }

          state.feed = newFeed;
        }

        if (oldStream === null) {
          const cachedStream = await persistentStore.findStream(session.id);

          if (cachedStream !== null) {
            state.stream = cachedStream;
            return;
          }
        }

        let newStream = await feedlyClient.getStreamContents(
          credential.accessToken,
          session.id,
          { ...session.settings, continuation: oldStream?.continuation },
        );

        if (oldStream !== null) {
          newStream = mergeStreams(oldStream, newStream);
        }

        if (newStream.title !== undefined) {
          state.session = { ...session, title: newStream.title };
        }

        state.stream = newStream;
      } finally {
        state.streamLoading = false;
      }
    });
  };
}

export function markAllAsRead(): AppAction<Promise<void>> {
  return (context) => {
    const { state$ } = context;

    return state$.mutate(async (state) => {
      const { session, stream } = state;

      if (session === null || stream === null) {
        return;
      }

      state.markerUpdating = true;

      try {
        await updateMarkers(context, session.id);

        state.session = {
          ...session,
          readIndex: stream.items.length - 1,
        };
        state.readCounts = incrementReadCounts(
          state.readCounts,
          stream.items.slice(Math.max(0, session.readIndex)),
        );
      } finally {
        state.markerUpdating = false;
      }
    });
  };
}

export function markAsRead(): AppAction<Promise<void>> {
  return (context) => {
    const { state$ } = context;

    return state$.mutate(async (state) => {
      const { session, stream } = state;

      if (
        session === null ||
        session.scrollIndex <= session.readIndex ||
        stream === null
      ) {
        return;
      }

      state.markerUpdating = true;

      try {
        const lastReadEntry = stream.items[session.scrollIndex]!;

        await updateMarkers(context, session.id, lastReadEntry.id);

        state.session = {
          ...session,
          readIndex: session.scrollIndex,
        };
        state.readCounts = incrementReadCounts(
          state.readCounts,
          stream.items.slice(
            Math.max(0, session.readIndex),
            session.scrollIndex,
          ),
        );
      } finally {
        state.markerUpdating = false;
      }
    });
  };
}

export function setDefaultSessionSettings(
  settings: SessionSettings,
): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.defaultSessionSettings = settings;
    });
  };
}

export function setSessionSettings(settings: SessionSettings): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      const { session } = state;
      if (session === null) {
        return;
      }

      state.session = {
        ...session,
        settings,
      };
      state.stream = null;
    });
  };
}

export function startSettion(streamId: string): AppAction<Promise<void>> {
  return ({ state$, persistentStore }) => {
    return state$.mutate(async (state) => {
      const {
        defaultSessionSettings,
        feed,
        maxSessions,
        session: oldSession,
        stream,
      } = state;
      let { pastSessions } = state;

      const index = pastSessions.findIndex(
        (pastSession) => pastSession.id === streamId,
      );
      let newSession: Session;

      if (index >= 0) {
        const pastSession = pastSessions[index]!;
        newSession = {
          ...pastSession,
          settings: pastSession.settings,
        };
        pastSessions = pastSessions.toSpliced(index, 1);
      } else {
        newSession = {
          expandedIndex: -1,
          id: streamId,
          readIndex: -1,
          scrollIndex: -1,
          settings: defaultSessionSettings,
          title: guessStreamTitle(streamId),
        };
      }

      if (oldSession !== null && oldSession.id !== streamId) {
        pastSessions = pastSessions.concat(oldSession);
      }

      const sweepCount = Math.max(0, pastSessions.length - maxSessions);
      const sweptSessions = pastSessions.slice(0, sweepCount);

      for (const sweptSession of sweptSessions) {
        await persistentStore.deleteStream(sweptSession.id);

        if (isFeedId(sweptSession.id)) {
          await persistentStore.deleteFeed(sweptSession.id);
        }
      }

      if (stream !== null) {
        await persistentStore.addStream(stream);
      }

      if (feed !== null) {
        await persistentStore.addFeed(feed);
      }

      state.feed = null;
      state.stream = null;
      state.session = newSession;
      state.pastSessions = pastSessions.slice(sweepCount);
    });
  };
}

export function toggleHatenaBookmark(
  entryId: string,
  shown: boolean,
): AppAction<void> {
  return ({ state$ }) => {
    findEntry(state$, entryId)?.mutate((entry) => {
      entry.hatenaBookmarkShown = shown;
    });
  };
}

export function toggleFullContent(
  entryId: string,
  shown: boolean,
): AppAction<void> {
  return ({ state$ }) => {
    findEntry(state$, entryId)?.mutate((entry) => {
      entry.fullContentShown = shown;
    });
  };
}

export function tagEntry(
  entryId: string,
  tagId: string,
): AppAction<Promise<void> | void> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return findEntry(state$, entryId)?.mutate(async (entry) => {
      const credential = await acquireCredential(context);

      await feedlyClient.tagEntry(credential.accessToken, [tagId], {
        entryId: entry.id,
      });

      entry.tags = (entry.tags ?? []).concat({ id: tagId });
    });
  };
}

export function untagEntry(
  entryId: string,
  tagId: string,
): AppAction<Promise<void> | void> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return findEntry(state$, entryId)?.mutate(async (entry) => {
      const credential = await acquireCredential(context);

      await feedlyClient.untagEntry(credential.accessToken, [tagId], {
        entryId: entry.id,
      });

      entry.tags = (entry.tags ?? []).filter((tag) => tag.id !== tagId);
    });
  };
}

export function updateSiteinfos(): AppAction<Promise<void>> {
  return (context) => {
    const { state$, wedataClient } = context;

    return state$.mutate(async (state) => {
      state.siteinfos = await wedataClient.getAutoPagerizeItems();
      state.siteinfosUpdated = Date.now();

      sendNotification(
        'info',
        `${state.siteinfos.length} siteinfos are loaded.`,
      )(context);
    });
  };
}

function extractFullContentBySiteinfos(
  document: Document,
  siteinfos: Siteinfo[],
): FullContent | null {
  for (const siteinfo of siteinfos) {
    const { url, nextLink, pageElement } = siteinfo.data;

    if (!tryTestPattern(url, document.baseURI)) {
      continue;
    }

    const pageResult = tryEvaluateXPath(
      document,
      pageElement,
      document.body,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );

    if (pageResult === null || pageResult.singleNodeValue === null) {
      continue;
    }

    const nextLinkResult = tryEvaluateXPath(
      document,
      nextLink,
      document.body,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    const nextUrl =
      nextLinkResult?.stringValue !== undefined &&
      nextLinkResult.stringValue !== url
        ? nextLinkResult.stringValue
        : null;

    return {
      url: document.baseURI,
      content: serializeNode(pageResult.singleNodeValue),
      nextUrl,
    };
  }

  return null;
}

function extractFullContentByReadability(
  document: Document,
): FullContent | null {
  const content = new Readability(document).parse()?.content;
  if (content == null) {
    return null;
  }

  return {
    url: document.baseURI,
    content,
    nextUrl: null,
  };
}

function findEntry(
  state$: Reactive<AppState>,
  entryId: string,
): Reactive<Entry> | null {
  const items$ = state$.get('stream').get('items');
  if (items$ === null) {
    return null;
  }

  const index = items$.value.findIndex((item) => item.id === entryId);
  if (index < 0) {
    return null;
  }

  return items$.get(index) as Reactive<Entry>;
}

function getStreamType(streamId: string): 'category' | 'feed' | 'tag' | null {
  return (streamId.match(STREAM_ID_PATTERN)?.groups?.['type'] ??
    null) as ReturnType<typeof getStreamType>;
}

function guessStreamTitle(streamId: string): string {
  return streamId.match(STREAM_ID_PATTERN)?.groups?.['title'] ?? 'No Title';
}

function incrementReadCounts(
  readCounts: ImmutableMap<string, number>,
  items: Entry[],
): ImmutableMap<string, number> {
  return items.reduce(
    (readCounts, item) =>
      readCounts.updateOrInsert(
        item.originId,
        (count) => count + 1,
        () => 1,
      ),
    readCounts,
  );
}

function isFeedId(streamId: string): boolean {
  return streamId.startsWith('feed/');
}

function mergeStreams(oldStream: Stream, newStream: Stream): Stream {
  return {
    ...newStream,
    items: oldStream.items.concat(newStream.items),
  };
}

function serializeNode(node: Node): string {
  return node instanceof Element
    ? node.outerHTML
    : new XMLSerializer().serializeToString(node);
}

function* splitStrings(
  components: string[],
  maxBytes: number,
): Generator<string[]> {
  let chunk: string[] = [];
  let chunkBytes = 0;

  for (const component of components) {
    const { length } = component;

    if (chunkBytes + length <= maxBytes) {
      chunk.push(component);
      chunkBytes += length;
    } else {
      yield chunk;
      chunk = [component];
      chunkBytes = length;
    }
  }

  if (chunk.length > 0) {
    yield chunk;
  }
}

function tryEvaluateXPath(
  document: Document,
  expression: string,
  contextNode: Node,
  resolver: XPathNSResolver | null,
  type: number,
  result: XPathResult | null,
): XPathResult | null {
  try {
    return document.evaluate(expression, contextNode, resolver, type, result);
  } catch {
    return null;
  }
}

function tryTestPattern(pattern: string, str: string): boolean {
  try {
    return new RegExp(pattern).test(str);
  } catch {
    return false;
  }
}

async function updateMarkers(
  context: AppContext,
  id: string,
  lastReadEntryId?: string,
): Promise<void> {
  const { feedlyClient } = context;
  const credential = await acquireCredential(context);

  switch (getStreamType(id)) {
    case 'category':
      await feedlyClient.updateMarkers(credential.accessToken, {
        action: 'markAsRead',
        type: 'categories',
        categoryIds: [id],
        lastReadEntryId,
      });
      break;
    case 'feed':
      await feedlyClient.updateMarkers(credential.accessToken, {
        action: 'markAsRead',
        type: 'feeds',
        feedIds: [id],
        lastReadEntryId,
      });
      break;
    case 'tag':
      await feedlyClient.updateMarkers(credential.accessToken, {
        action: 'markAsRead',
        type: 'tags',
        tagIds: [id],
        lastReadEntryId,
      });
      break;
  }
}
