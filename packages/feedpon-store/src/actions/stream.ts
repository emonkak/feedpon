import { Readability } from '@mozilla/readability';
import type { Reactive } from 'barebind/addons/reactive';
import type { AppAction } from '../index.ts';
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
  type URLFilter,
} from '../index.ts';
import { decodeResponse } from '../utils/decodeResponse.ts';
import { acquireCredential } from './auth.ts';
import { sendNotification } from './ui.ts';

const MAX_URL_LENGTH = 2048;

const STREAM_LAYOUTS: StreamLayout[] = ['full', 'compact'];

export function clearSessions(): AppAction<Promise<void>> {
  return (state$, { stateRepository }) => {
    return state$.mutate(async (state) => {
      state.session = null;
      state.pastSessions = [];
      state.feed = null;
      state.stream = null;

      await stateRepository.deleteAllFeeds();
      await stateRepository.deleteAllStreams();
    });
  };
}

export function expandEntry(index: number): AppAction<void> {
  return (state$) => {
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
  return (state$, _context, dispatch) => {
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

          if (siteinfosUpdated$.value < 0) {
            dispatch(updateSiteinfos());
          }

          const fullContent = extractFullContentBySiteinfos(
            document,
            siteinfos$.value,
            url,
          ) ??
            extractFullContentByReadability(document) ?? {
              url,
              content: '',
              nextUrl: null,
            };

          entry.fullContents = (entry.fullContents ?? []).concat(fullContent);
        } finally {
          entry.fullContents ??= [];
          entry.fullContentsLoading = false;
        }
      }) ?? Promise.resolve()
    );
  };
}

export function fetchHatenaBookmarkCounts(): AppAction<Promise<void>> {
  return (state$, { hatenaBookmarkClient }) => {
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
  return (state$, { hatenaBookmarkClient }) => {
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
  return (state$, { feedlyClient }, dispatch) => {
    return state$.mutate(async (state) => {
      const { feed: oldFeed, session, stream: oldStream, urlFilters } = state;

      if (session === null) {
        return;
      }

      state.streamLoading = true;

      try {
        const credential = await dispatch(acquireCredential());

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

        if (urlFilters.length > 0) {
          applyUrlFilters(newStream.items, urlFilters);
        }

        if (
          oldStream !== null &&
          oldStream.id === session.id &&
          continuation !== undefined
        ) {
          newStream = mergeStreams(oldStream, newStream);

          state.session = {
            ...session,
            updated: Date.now(),
          };
        } else {
          state.session = {
            ...session,
            expandedIndex: -1,
            focusIndex: -1,
            readIndex: -1,
            title: newStream.title ?? session.title,
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
  return (state$) => {
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
  return (state$, { feedlyClient }, dispatch) => {
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
        const credential = await dispatch(acquireCredential());
        const parsedId = parseStreamId(session.id);

        switch (parsedId.type) {
          case 'category':
            await feedlyClient.updateMarker(credential.accessToken, {
              action: 'markAsRead',
              type: 'categories',
              categoryIds: [session.id],
              lastReadEntryId: latestItem?.id,
            });
            break;
          case 'feed':
            await feedlyClient.updateMarker(credential.accessToken, {
              action: 'markAsRead',
              type: 'feeds',
              feedIds: [session.id],
              lastReadEntryId: latestItem?.id,
            });
            break;
          case 'tag':
            await feedlyClient.updateMarker(credential.accessToken, {
              action: 'markAsRead',
              type: 'tags',
              tagIds: [session.id],
              lastReadEntryId: latestItem?.id,
            });
            break;
        }

        state.session = {
          ...session,
          readIndex: stream.items.length - 1,
        };

        state.readCounts = stream.items.reduce(
          (readCounts, item) =>
            readCounts.updateOrInsert(
              item.origin.streamId,
              (count) => count + 1,
              () => 1,
            ),
          readCounts,
        );
      } finally {
        state.streamUpdating = false;
      }

      dispatch(
        sendNotification(
          'info',
          `${stream.items.length} entries are marked as read.`,
        ),
      );
    });
  };
}

export function quitSession(): AppAction<Promise<void>> {
  return (state$, { stateRepository }) => {
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
        await stateRepository.deleteStream(sweptSession.id);

        if (isFeedId(sweptSession.id)) {
          await stateRepository.deleteFeed(sweptSession.id);
        }
      }

      if (stream !== null) {
        await stateRepository.addStream(stream);
      }

      if (feed !== null) {
        await stateRepository.addFeed(feed);
      }

      state.feed = null;
      state.stream = null;
      state.session = null;
      state.pastSessions = pastSessions.slice(sweepCount).concat(session);
    });
  };
}

export function shrinkEntry(): AppAction<void> {
  return (state$) => {
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
  return (state$, { stateRepository }) => {
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
        await stateRepository.deleteStream(sweptSession.id);

        if (isFeedId(sweptSession.id)) {
          await stateRepository.deleteFeed(sweptSession.id);
        }
      }

      if (stream !== null) {
        await stateRepository.addStream(stream);
      }

      if (feed !== null) {
        await stateRepository.addFeed(feed);
      }

      const newFeed = isFeedId(streamId)
        ? await stateRepository.findFeed(streamId)
        : null;
      const newStream = await stateRepository.findStream(streamId);

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
  return (state$, { feedlyClient }, dispatch) => {
    return (
      findEntry(state$, entryId)?.mutate(async (entry) => {
        const credential = await dispatch(acquireCredential());

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
  return (state$) => {
    findEntry(state$, entryId)?.mutate((entry) => {
      entry.fullContentsShown = shown;
    });
  };
}

export function toggleHatenaBookmarkEntry(
  entryId: string,
  shown: boolean,
): AppAction<void> {
  return (state$) => {
    findEntry(state$, entryId)?.mutate((entry) => {
      entry.hatenaBookmarkEntryShown = shown;
    });
  };
}

export function toggleStreamLayout(): AppAction<void> {
  return (state$) => {
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
  return (state$, { feedlyClient }, dispatch) => {
    return (
      findEntry(state$, entryId)?.mutate(async (entry) => {
        const credential = await dispatch(acquireCredential());

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
  return (state$) => {
    state$.mutate((state) => {
      state.defaultSessionSettings = settings;
    });
  };
}

export function updateSessionSettings(
  settings: SessionSettings,
): AppAction<void> {
  return (state$) => {
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
  return (state$, { wedataClient }, dispatch) => {
    return state$.mutate(async (state) => {
      state.siteinfos = await wedataClient.getAutoPagerizeItems();
      state.siteinfosUpdated = Date.now();

      dispatch(
        sendNotification(
          'info',
          `${state.siteinfos.length} siteinfos are loaded.`,
        ),
      );
    });
  };
}

export function updateStreamSettings(
  streamSettings: StreamSettings,
): AppAction<void> {
  return (state$) => {
    state$.mutate((state) => {
      state.streamSettings = streamSettings;
    });
  };
}

function applyUrlFilters(items: Entry[], filters: URLFilter[]): void {
  for (const filter of filters) {
    const pattern = tryConstructRegExp(filter.pattern, filter.flags);
    if (pattern === null) {
      continue;
    }
    for (const item of items) {
      if (item.canonicalUrl !== undefined) {
        item.canonicalUrl = item.canonicalUrl.replace(
          pattern,
          filter.replacement,
        );
      }
      if (item.alternate !== undefined) {
        for (const link of item.alternate) {
          link.href = link.href.replace(pattern, filter.replacement);
        }
      }
      item.origin.htmlUrl = item.origin.htmlUrl.replace(
        pattern,
        filter.replacement,
      );
    }
  }
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
  url: string,
): FullContent | null {
  for (const siteinfo of siteinfos) {
    const { url: urlPattern, nextLink, pageElement } = siteinfo.data;

    if (!tryTestPattern(urlPattern, url)) {
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

    if (!(pageResult?.singleNodeValue instanceof Element)) {
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
      nextLinkResult?.singleNodeValue instanceof Element
        ? nextLinkResult.singleNodeValue.getAttribute('href')
        : null;

    return {
      url,
      content: pageResult.singleNodeValue.outerHTML,
      nextUrl: nextUrl !== null ? new URL(nextUrl, url).toString() : null,
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

function tryConstructRegExp(pattern: string, flags: string): RegExp | null {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
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
