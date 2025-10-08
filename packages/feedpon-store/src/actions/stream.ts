import { Readability } from '@mozilla/readability';
import type { Reactive } from 'barebind/extras/reactive';
import type { AppAction, AppContext } from '../action.ts';
import {
  type AppState,
  type Entry,
  type FullContent,
  getEntryUrl,
  parseStreamId,
  type Session,
  type SessionSettings,
  type Siteinfo,
  type Stream,
  type StreamLayout,
  type StreamSettings,
} from '../state.ts';
import { absolutifyUrls } from '../utils/absolutifyUrls.ts';
import { decodeResponse } from '../utils/decodeResponse.ts';
import { acquireCredential } from './auth.ts';
import { sendNotification } from './ui.ts';

const MAX_URL_LENGTH = 2048;

const STREAM_LAYOUTS: StreamLayout[] = ['full', 'compact'];

export function clearSessions(): AppAction<Promise<void>> {
  return ({ state$, persistentStore }) => {
    return state$.mutate(async (state) => {
      state.session = null;
      state.pastSessions = [];
      state.feed = null;
      state.stream = null;

      await persistentStore.deleteAllFeeds();
      await persistentStore.deleteAllStreams();
    });
  };
}

export function expandEntry(index: number): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      if (state.session === null || state.session.expandedIndex === index) {
        return;
      }

      state.session = {
        ...state.session,
        expandedIndex: index,
      };
    });
  };
}

export function fetchFullContents(entryId: string): AppAction<Promise<void>> {
  return (context) => {
    const { state$ } = context;
    const siteinfos$ = state$.get('siteinfos');
    const siteinfosUpdated$ = state$.get('siteinfosUpdated');

    return (
      findEntry(state$, entryId)?.mutate(async (entry) => {
        const url =
          entry.fullContents !== undefined
            ? entry.fullContents.at(-1)?.nextUrl
            : getEntryUrl(entry);
        if (url == null) {
          return;
        }

        entry.fullContentsLoading = true;

        try {
          const response = await fetch(url, {
            credentials: 'include',
            mode: 'cors',
          });
          const content = await decodeResponse(response);
          const document = new DOMParser().parseFromString(
            content,
            'text/html',
          );

          absolutifyUrls(document, url);

          if (siteinfosUpdated$.value < 0) {
            updateSiteinfos()(context);
          }

          const fullContent = extractFullContentBySiteinfos(
            document,
            siteinfos$.value,
          ) ??
            extractFullContentByReadability(document) ?? {
              url: document.baseURI,
              content: '',
              nextUrl: null,
            };

          entry.fullContents = (entry.fullContents ?? []).concat(fullContent);
        } finally {
          entry.fullContentsLoading = false;
        }
      }) ?? Promise.resolve()
    );
  };
}

export function fetchHatenaBookmarkCounts(): AppAction<Promise<void>> {
  return ({ hatenaBookmarkClient, state$ }) => {
    return state$.mutate(async (state) => {
      const { stream } = state;

      if (stream === null) {
        return;
      }

      const urls = stream.items
        .filter((item) => item.hatenaBookmarkCount === undefined)
        .map((item) => getEntryUrl(item));

      if (urls.length > 0) {
        const newItems = stream.items.slice();

        for (const chunkedUrls of splitStrings(urls, MAX_URL_LENGTH)) {
          const counts = await hatenaBookmarkClient.getMultipleBookmarkCounts({
            url: chunkedUrls,
          });

          for (let i = 0, l = newItems.length; i < l; i++) {
            const item = newItems[i]!;
            const url = getEntryUrl(item);
            if (Object.hasOwn(counts, url)) {
              newItems[i] = {
                ...item,
                hatenaBookmarkCount: counts[url],
              };
            }
          }
        }

        state.stream = { ...stream, items: newItems };
      }
    });
  };
}

export function fetchHatenaBookmarkEntry(
  entryId: string,
): AppAction<Promise<void>> {
  return ({ state$, hatenaBookmarkClient }) => {
    return (
      findEntry(state$, entryId)?.mutate(async (entry) => {
        entry.hatenaBookmarkEntryLoading = true;

        try {
          entry.hatenaBookmarkEntry = await hatenaBookmarkClient.getEntry({
            url: getEntryUrl(entry),
          });
        } finally {
          entry.hatenaBookmarkEntryLoading = false;
        }
      }) ?? Promise.resolve()
    );
  };
}

export function fetchStream(continuation?: string): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      const { feed: oldFeed, session, stream: oldStream } = state;

      if (session === null) {
        return;
      }

      state.streamLoading = true;

      try {
        const credential = await acquireCredential()(context);

        if (oldFeed === null && isFeedId(session.id)) {
          state.feed = await feedlyClient.getFeed(
            credential.accessToken,
            session.id,
          );
        }

        let newStream = await feedlyClient.getStreamContents(
          credential.accessToken,
          session.id,
          { ...session.settings, continuation },
        );

        if (oldStream !== null && continuation !== undefined) {
          newStream = mergeStreams(oldStream, newStream);
        }

        if (newStream.title !== undefined) {
          state.session = {
            ...session,
            title: newStream.title,
            updated: Date.now(),
          };
        }

        state.stream = newStream;
      } finally {
        state.streamLoading = false;
      }
    });
  };
}

export function focusEntry(index: number): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      if (state.session === null) {
        return;
      }

      state.session = {
        ...state.session,
        focusIndex: index,
      };
    });
  };
}

export function markStreamAsRead(): AppAction<Promise<void>> {
  return (context) => {
    const { state$ } = context;

    return state$.mutate(async (state) => {
      const { readCounts, session, stream } = state;

      if (session === null || stream === null) {
        return;
      }

      const latestItem =
        session.settings.ranked === 'newest'
          ? stream.items[0]
          : stream.items.at(-1);

      if (latestItem === undefined) {
        return;
      }

      state.streamUpdating = true;

      try {
        await updateMarker(context, session.id, latestItem?.id);

        state.session = {
          ...session,
          readIndex: stream.items.length - 1,
        };
        state.readCounts = readCounts.updateOrInsert(
          stream.id,
          (count) => count + stream.items.length,
          () => stream.items.length,
        );
      } finally {
        state.streamUpdating = false;
      }
    });
  };
}

export function quitSession(): AppAction<Promise<void>> {
  return ({ state$, persistentStore }) => {
    return state$.mutate(async (state) => {
      const { feed, pastSessions, session, stream, streamSettings } = state;

      if (session === null) {
        return;
      }

      const sweepCount = Math.max(
        0,
        pastSessions.length - streamSettings.maxSessions,
      );
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
      state.session = null;
      state.pastSessions = pastSessions.slice(sweepCount).concat(session);
    });
  };
}

export function shrinkEntry(): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      if (state.session === null || state.session.expandedIndex < 0) {
        return;
      }

      state.session = {
        ...state.session,
        expandedIndex: -1,
      };
    });
  };
}

export function startSession(streamId: string): AppAction<Promise<void>> {
  return ({ state$, persistentStore }) => {
    return state$.mutate(async (state) => {
      const {
        defaultSessionSettings,
        feed,
        streamSettings,
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
          focusIndex: -1,
          settings: defaultSessionSettings,
          title: '',
          updated: Date.now(),
        };
      }

      if (oldSession !== null && oldSession.id !== streamId) {
        pastSessions = pastSessions.concat(oldSession);
      }

      const sweepCount = Math.max(
        0,
        pastSessions.length - streamSettings.maxSessions,
      );
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

      const newFeed = isFeedId(streamId)
        ? await persistentStore.findFeed(streamId)
        : null;
      const newStream = await persistentStore.findStream(streamId);

      state.feed = newFeed;
      state.stream = newStream;
      state.session = newSession;
      state.pastSessions = pastSessions.slice(sweepCount);
    });
  };
}

export function tagEntry(
  entryId: string,
  tagId: string,
): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return (
      findEntry(state$, entryId)?.mutate(async (entry) => {
        const credential = await acquireCredential()(context);

        await feedlyClient.tagEntry(credential.accessToken, [tagId], {
          entryId: entry.id,
        });

        entry.tags = (entry.tags ?? []).concat({ id: tagId });
      }) ?? Promise.resolve()
    );
  };
}

export function toggleFullContents(
  entryId: string,
  shown: boolean,
): AppAction<void> {
  return ({ state$ }) => {
    findEntry(state$, entryId)?.mutate((entry) => {
      entry.fullContentsShown = shown;
    });
  };
}

export function toggleHatenaBookmarkEntry(
  entryId: string,
  shown: boolean,
): AppAction<void> {
  return ({ state$ }) => {
    findEntry(state$, entryId)?.mutate((entry) => {
      entry.hatenaBookmarkEntryShown = shown;
    });
  };
}

export function toggleStreamLayout(): AppAction<void> {
  return ({ state$ }) => {
    const session$ = state$.get('session');

    return session$?.mutate((session) => {
      if (session === null) {
        return;
      }

      const index = STREAM_LAYOUTS.indexOf(session.settings.layout);
      const layout = STREAM_LAYOUTS[(index + 1) % STREAM_LAYOUTS.length]!;

      session.settings = {
        ...session.settings,
        layout,
      };
      session.expandedIndex = -1;
    });
  };
}

export function untagEntry(
  entryId: string,
  tagId: string,
): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return (
      findEntry(state$, entryId)?.mutate(async (entry) => {
        const credential = await acquireCredential()(context);

        await feedlyClient.untagEntry(credential.accessToken, [tagId], {
          entryId: entry.id,
        });

        entry.tags = (entry.tags ?? []).filter((tag) => tag.id !== tagId);
      }) ?? Promise.resolve()
    );
  };
}

export function updateDefaultSessionSettings(
  settings: SessionSettings,
): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.defaultSessionSettings = settings;
    });
  };
}

export function updateSessionSettings(
  settings: SessionSettings,
): AppAction<void> {
  return ({ state$ }) => {
    state$.get('session').mutate((session) => {
      if (session === null) {
        return;
      }

      session.settings = settings;
      session.expandedIndex = -1;
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

export function updateStreamSettings(
  streamSettings: StreamSettings,
): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.streamSettings = streamSettings;
    });
  };
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

async function updateMarker(
  context: AppContext,
  id: string,
  lastReadEntryId?: string,
): Promise<void> {
  const { feedlyClient } = context;
  const credential = await acquireCredential()(context);
  const parsedId = parseStreamId(id);

  switch (parsedId.type) {
    case 'category':
      await feedlyClient.updateMarker(credential.accessToken, {
        action: 'markAsRead',
        type: 'categories',
        categoryIds: [id],
        lastReadEntryId,
      });
      break;
    case 'feed':
      await feedlyClient.updateMarker(credential.accessToken, {
        action: 'markAsRead',
        type: 'feeds',
        feedIds: [id],
        lastReadEntryId,
      });
      break;
    case 'tag':
      await feedlyClient.updateMarker(credential.accessToken, {
        action: 'markAsRead',
        type: 'tags',
        tagIds: [id],
        lastReadEntryId,
      });
      break;
  }
}
