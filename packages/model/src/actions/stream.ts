import { Readability } from '@mozilla/readability';
import type { Derivable } from 'barebind/addons/signal';
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
  return async (state$, { stateRepository }) => {
    state$.scope((state) => {
      state.session = null;
      state.pastSessions = [];
      state.feed = null;
      state.stream = null;
    });

    await stateRepository.deleteAllFeeds();
    await stateRepository.deleteAllStreams();
  };
}

export function expandEntry(index: number): AppAction<void> {
  return (state$) => {
    state$.get('session').scope((session) => {
      if (session !== null) {
        session.expandedIndex = index;
      }
    });
  };
}

export function fetchFullContents(entryId: string): AppAction<Promise<void>> {
  return async (state$, _context, dispatch) => {
    const entry$ = lookupEntry(state$, entryId);
    if (entry$ === undefined) {
      return;
    }

    const fullContents$ = entry$.get('fullContents');
    const fullContentsLoading$ = entry$.get('fullContentsLoading');
    const siteinfos$ = state$.get('siteinfos');
    const siteinfosUpdated$ = state$.get('siteinfosUpdated');

    const url = entry$.scope((entry) => {
      return entry.fullContents !== undefined
        ? entry.fullContents.at(-1)?.nextUrl
        : getEntryUrl(entry);
    });
    if (url == null) {
      return;
    }

    fullContentsLoading$.value = true;

    try {
      const response = await fetch(url, {
        credentials: 'include',
        mode: 'cors',
      });
      const content = await decodeResponse(response);
      const document = new DOMParser().parseFromString(content, 'text/html');

      setDocumentBaseURI(document, url);

      if (siteinfosUpdated$.value < 0) {
        await dispatch(updateSiteinfos());
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

      fullContents$.value = (fullContents$.value ?? []).concat(fullContent);
    } finally {
      fullContents$.value ??= [];
      fullContentsLoading$.value = false;
    }
  };
}

export function fetchHatenaBookmarkCounts(): AppAction<Promise<void>> {
  return async (state$, { hatenaBookmarkClient }) => {
    const stream$ = state$.get('stream');
    if (stream$.value === null) {
      return;
    }

    const urls = stream$.value.items
      .filter((item) => item.hatenaBookmarkCount === undefined)
      .map((item) => getEntryUrl(item));

    if (urls.length > 0) {
      const newItems = stream$.value.items.slice();

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

      stream$.value = { ...stream$.value, items: newItems };
    }
  };
}

export function fetchHatenaBookmarkEntry(
  entryId: string,
): AppAction<Promise<void>> {
  return async (state$, { hatenaBookmarkClient }) => {
    const entry$ = lookupEntry(state$, entryId);
    if (entry$ === undefined) {
      return;
    }

    const hatenaBookmarkEntry$ = entry$.get('hatenaBookmarkEntry');
    const hatenaBookmarkEntryLoading$ = entry$.get(
      'hatenaBookmarkEntryLoading',
    );
    const hatenaBookmarkEntryShown$ = entry$.get('hatenaBookmarkEntryShown');
    const url = entry$.scope((entry) => getEntryUrl(entry));

    hatenaBookmarkEntryLoading$.value = true;

    try {
      hatenaBookmarkEntry$.value = await hatenaBookmarkClient.getEntry({
        url,
      });
      hatenaBookmarkEntryShown$.value = true;
    } finally {
      hatenaBookmarkEntryLoading$.value = false;
    }
  };
}

export function fetchStream(continuation?: string): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const session$ = state$.get('session');
    const session = session$.value;

    if (session === null) {
      return;
    }

    const feed$ = state$.get('feed');
    const stream$ = state$.get('stream');
    const streamLoading$ = state$.get('streamLoading');
    const urlFilters$ = state$.get('urlFilters');

    streamLoading$.value = true;

    try {
      const credential = await dispatch(acquireCredential());

      if (feed$.value === null && isFeedId(session.id)) {
        feed$.value = await feedlyClient.getFeed(
          credential.accessToken,
          session.id,
        );
      }

      let newStream = await feedlyClient.getStreamContents(
        credential.accessToken,
        session.id,
        { ...session.settings, continuation },
      );

      if (urlFilters$.value.length > 0) {
        applyUrlFilters(newStream.items, urlFilters$.value);
      }

      if (
        stream$.value !== null &&
        stream$.value.id === session.id &&
        continuation !== undefined
      ) {
        newStream = {
          ...newStream,
          items: stream$.value.items.concat(newStream.items),
        };
        session$.scope((session) => {
          if (session !== null) {
            session.updated = Date.now();
          }
        });
      } else {
        session$.scope((session) => {
          if (session !== null) {
            session.expandedIndex = -1;
            session.focusIndex = -1;
            session.readIndex = -1;
            session.title = newStream.title ?? session.title;
            session.updated = Date.now();
          }
        });
      }

      stream$.value = newStream;
    } finally {
      streamLoading$.value = false;
    }
  };
}

export function focusEntry(index: number): AppAction<void> {
  return (state$) => {
    const session$ = state$.get('session');
    session$.scope((session) => {
      if (session !== null) {
        session.focusIndex = index;
      }
    });
  };
}

export function markStreamAsRead(): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const readCounts$ = state$.get('readCounts');
    const session$ = state$.get('session');
    const stream$ = state$.get('stream');
    const streamLoading$ = state$.get('streamLoading');
    const session = session$.value;
    const stream = stream$.value;

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

    streamLoading$.value = true;

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

      session$.scope((session) => {
        if (session !== null) {
          session.readIndex = stream.items.length - 1;
        }
      });

      readCounts$.value = stream.items.reduce(
        (readCounts, item) =>
          readCounts.updateOrInsert(
            item.origin.streamId,
            (count) => count + 1,
            () => 1,
          ),
        readCounts$.value,
      );
    } finally {
      streamLoading$.value = false;
    }

    dispatch(
      sendNotification(
        'info',
        `${stream.items.length} entries are marked as read.`,
      ),
    );
  };
}

export function quitSession(): AppAction<Promise<void>> {
  return async (state$, { stateRepository }) => {
    const session$ = state$.get('session');
    const session = session$.value;

    if (session === null) {
      return;
    }

    const feed$ = state$.get('feed');
    const stream$ = state$.get('stream');
    const streamSettings$ = state$.get('streamSettings');
    const pastSessions$ = state$.get('pastSessions');

    const sweepCount = Math.max(
      0,
      pastSessions$.value.length - streamSettings$.value.maxSessions,
    );
    const sweptSessions = pastSessions$.value.slice(0, sweepCount);

    for (const sweptSession of sweptSessions) {
      await stateRepository.deleteStream(sweptSession.id);

      if (isFeedId(sweptSession.id)) {
        await stateRepository.deleteFeed(sweptSession.id);
      }
    }

    if (stream$.value !== null) {
      await stateRepository.addStream(stream$.value);
    }

    if (feed$.value !== null) {
      await stateRepository.addFeed(feed$.value);
    }

    feed$.value = null;
    stream$.value = null;
    session$.value = null;
    pastSessions$.value = pastSessions$.value.slice(sweepCount).concat(session);
  };
}

export function shrinkEntry(): AppAction<void> {
  return (state$) => {
    state$.get('session').scope((session) => {
      if (session !== null) {
        session.expandedIndex = -1;
      }
    });
  };
}

export function startSession(streamId: string): AppAction<Promise<void>> {
  return async (state$, { stateRepository }) => {
    const defaultSessionSettings$ = state$.get('defaultSessionSettings');
    const feed$ = state$.get('feed');
    const pastSessions$ = state$.get('pastSessions');
    const session$ = state$.get('session');
    const stream$ = state$.get('stream');
    const streamSettings$ = state$.get('streamSettings');
    const session = session$.value;
    let pastSessions = pastSessions$.value;

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
        settings: defaultSessionSettings$.value,
        title: '',
        updated: Date.now(),
      };
    }

    if (session !== null && session.id !== streamId) {
      pastSessions = pastSessions.concat(session);
    }

    const sweepCount = Math.max(
      0,
      pastSessions.length - streamSettings$.value.maxSessions,
    );
    const sweptSessions = pastSessions.slice(0, sweepCount);

    for (const sweptSession of sweptSessions) {
      await stateRepository.deleteStream(sweptSession.id);

      if (isFeedId(sweptSession.id)) {
        await stateRepository.deleteFeed(sweptSession.id);
      }
    }

    if (stream$.value !== null) {
      await stateRepository.addStream(stream$.value);
    }

    if (feed$.value !== null) {
      await stateRepository.addFeed(feed$.value);
    }

    const newFeed = isFeedId(streamId)
      ? await stateRepository.findFeed(streamId)
      : null;
    const newStream = await stateRepository.findStream(streamId);

    feed$.value = newFeed;
    stream$.value = newStream;
    session$.value = newSession;
    pastSessions$.value = pastSessions.slice(sweepCount);
  };
}

export function tagEntry(
  entryId: string,
  tagId: string,
): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const entry$ = lookupEntry(state$, entryId);
    if (entry$ === undefined) {
      return;
    }

    const credential = await dispatch(acquireCredential());

    await feedlyClient.tagEntry(credential.accessToken, [tagId], {
      entryId: entryId,
    });

    entry$.scope((entry) => {
      entry.tags = (entry.tags ?? []).concat({ id: tagId });
    });
  };
}

export function toggleFullContents(
  entryId: string,
  shown: boolean,
): AppAction<void> {
  return (state$) => {
    lookupEntry(state$, entryId)?.scope((entry) => {
      entry.fullContentsShown = shown;
    });
  };
}

export function toggleHatenaBookmarkEntry(
  entryId: string,
  shown: boolean,
): AppAction<void> {
  return (state$) => {
    const entry$ = lookupEntry(state$, entryId);
    entry$?.scope((entry) => {
      entry.hatenaBookmarkEntryShown = shown;
    });
  };
}

export function toggleStreamLayout(): AppAction<void> {
  return (state$) => {
    const session$ = state$.get('session');

    return session$?.scope((session) => {
      if (session === null) {
        return;
      }

      const index = STREAM_LAYOUTS.indexOf(session.settings.layout);
      const layout = STREAM_LAYOUTS[(index + 1) % STREAM_LAYOUTS.length]!;

      session.settings.layout = layout;
      session.expandedIndex = -1;
    });
  };
}

export function untagEntry(
  entryId: string,
  tagId: string,
): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const entry$ = lookupEntry(state$, entryId);
    if (entry$ === undefined) {
      return;
    }

    const credential = await dispatch(acquireCredential());

    await feedlyClient.untagEntry(credential.accessToken, [tagId], {
      entryId,
    });

    entry$.scope((entry) => {
      entry.tags = (entry.tags ?? []).filter((tag) => tag.id !== tagId);
    });
  };
}

export function updateDefaultSessionSettings(
  settings: SessionSettings,
): AppAction<void> {
  return (state$) => {
    state$.scope((state) => {
      state.defaultSessionSettings = settings;
    });
  };
}

export function updateSessionSettings(
  settings: SessionSettings,
): AppAction<void> {
  return (state$) => {
    const session$ = state$.get('session');
    session$.scope((session) => {
      if (session === null) {
        return;
      }

      session.settings = settings;
      session.expandedIndex = -1;
    });
  };
}

export function updateSiteinfos(): AppAction<Promise<void>> {
  return async (state$, { wedataClient }, dispatch) => {
    const siteinfos = await wedataClient.getAutoPagerizeItems();

    state$.scope((state) => {
      state.siteinfos = siteinfos;
      state.siteinfosUpdated = Date.now();
    });

    dispatch(
      sendNotification('info', `${siteinfos.length} siteinfos are loaded.`),
    );
  };
}

export function updateStreamSettings(
  streamSettings: StreamSettings,
): AppAction<void> {
  return (state$) => {
    state$.scope((state) => {
      state.streamSettings = streamSettings;
    });
  };
}

function aggregateIteratorResult(result: XPathResult): string {
  const serializer = new XMLSerializer();
  let node: Node | null;
  let html = '';
  while ((node = result.iterateNext()) !== null) {
    html +=
      node instanceof Element
        ? node.outerHTML
        : serializer.serializeToString(node);
  }
  return html;
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
  const content = new Readability(document, { keepClasses: true }).parse()
    ?.content;
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

    if (
      // Ignore generic rules.
      tryTestPattern(urlPattern, 'https://example.com') ||
      !tryTestPattern(urlPattern, url)
    ) {
      continue;
    }

    const contentResult = tryEvaluateXPath(
      document,
      pageElement,
      document.body,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null,
    );
    if (contentResult === null) {
      continue;
    }

    const content = aggregateIteratorResult(contentResult);
    if (content === '') {
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
    const href =
      nextLinkResult?.singleNodeValue instanceof Element
        ? nextLinkResult.singleNodeValue.getAttribute('href')
        : null;
    const nextUrl = href !== null ? new URL(href, url).toString() : null;

    return {
      url,
      content,
      nextUrl,
    };
  }

  return null;
}

function lookupEntry(
  state$: Derivable<AppState>,
  entryId: string,
): Derivable<Entry> | undefined {
  const items$ = state$.get('stream').get('items');
  if (items$ === undefined) {
    return undefined;
  }

  const index = items$.value.findIndex((item) => item.id === entryId);
  if (index < 0) {
    return undefined;
  }

  return items$.get(index) as Derivable<Entry>;
}

function isFeedId(streamId: string): boolean {
  return streamId.startsWith('feed/');
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

function setDocumentBaseURI(document: Document, url: string): void {
  for (const el of document.head.querySelectorAll('base')) {
    el.remove();
  }
  const base = document.createElement('base');
  base.setAttribute('href', url);
  base.setAttribute('target', '_blank');
  document.head.appendChild(base);
}
