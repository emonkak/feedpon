import type { Reactive } from 'barebind/extras/reactive';
import type * as v from 'valibot';

import type {
  Entry,
  FeedlyClient,
  GetStreamContentsRequest,
  Stream,
} from '../apis/feedly.ts';
import type {
  BookmarkEntry,
  HatenaBookmarkClient,
} from '../apis/hatenaBookmark.ts';
import type { WedataItem } from '../apis/wedata.ts';
import type { PersistentStore } from '../persistent/types.ts';
import { type AuthContext, type AuthState, acquireCredential } from './auth.ts';
import type { Feed } from './subscription.ts';

const STREAM_ID_PATTERN =
  /^(?<type>feed)\/(?<title>.*)|^user\/[^/]*\/(?<type>category|tag)\/(?<title>[^/]*)/;

const MAX_URL_LENGTH = 4096;

export interface Entry extends v.InferOutput<typeof Entry> {
  fullContents?: FullContents;
  hatenaBookmarkCount?: number;
  hatenaBookmarkEntry?: v.InferOutput<typeof BookmarkEntry>;
  hatenaBookmarkLoading?: boolean;
}

export type EntryOrdering = GetStreamContentsRequest['ranked'];

export interface FullContents {
  loading: boolean;
  pages: Page[];
  shown: boolean;
}

export interface MuteFilter {
  keyword: string;
  targets: MuteTarget[];
}

export type MuteTarget = 'title' | 'content' | 'tag';

export interface Page {
  url: string;
  content: string;
  nextUrl: string;
}

export interface Siteinfo extends v.InferOutput<typeof WedataItem> {
  data: {
    url: string;
    nextLink: string;
    pageElement: string;
    exampleUrl?: string;
    insertBefore?: string;
  };
}

export interface Stream extends v.InferOutput<typeof Stream> {
  items: Entry[];
}

export type StreamAction<T> = (context: StreamContext) => T;

export interface StreamContext extends AuthContext {
  feedlyClient: FeedlyClient;
  hatenaBookmarkClient: HatenaBookmarkClient;
  persistentStore: PersistentStore;
  state$: Reactive<{ authState: AuthState; streamState: StreamState }>;
}

export type StreamLayout = 'full' | 'compact';

export interface StreamSession {
  id: string;
  readPosition: number;
  scrollPosition: number;
  settings: StreamSessionSettings;
  title: string;
}

export interface StreamSessionSettings {
  count: number;
  layout: StreamLayout;
  ranked: EntryOrdering;
  unreadOnly: boolean;
}

export interface URLFilter {
  flags: string;
  pattern: string;
  replacement: string;
}

export class StreamState {
  defaultSettings: StreamSessionSettings = {
    count: 50,
    layout: 'full',
    ranked: 'newest',
    unreadOnly: true,
  };
  feed: Feed | null = null;
  loading: boolean = false;
  markerUpdating: boolean = false;
  maxSessions: number = 20;
  muteFilters: MuteFilter[] = [];
  pastSessions: StreamSession[] = [];
  session: StreamSession | null = null;
  siteinfosUpdated: number = -1;
  siteinfos: Siteinfo[] = [];
  stream: Stream | null = null;
  urlFilter: URLFilter[] = [];
}

export function fetchHatenaBookmarkCounts(): StreamAction<Promise<void>> {
  return async ({ hatenaBookmarkClient, state$ }) => {
    const items$ = state$.get('streamState').get('stream').get('items');
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
): StreamAction<Promise<void>> {
  return async ({ state$, hatenaBookmarkClient }) => {
    const items$ = state$.get('streamState').get('stream').get('items');
    if (items$ === null) {
      return;
    }

    const foundIndex = items$.value.findIndex((item) => item.id === entryId);

    if (foundIndex !== undefined) {
      const item$ = items$.get(foundIndex)!;
      const item = item$.value!;

      item$.value = {
        ...item,
        hatenaBookmarkLoading: true,
      };

      try {
        const entry = await hatenaBookmarkClient.getBookmarkEntry({
          uri: item.origin.htmlUrl,
        });

        item$.value = {
          ...item,
          hatenaBookmarkEntry: entry,
          hatenaBookmarkLoading: false,
        };
      } catch (e) {
        item$.value = {
          ...item,
          hatenaBookmarkLoading: false,
        };
        throw e;
      }
    }
  };
}

export function fetchStream(): StreamAction<Promise<void>> {
  return (context: StreamContext) => {
    const { feedlyClient, persistentStore, state$ } = context;
    const streamState$ = state$.get('streamState');

    return streamState$.mutate(async (state) => {
      const { feed: oldFeed, session, stream: oldStream } = state;

      if (session === null) {
        return;
      }

      state.loading = true;

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
        state.loading = false;
      }
    });
  };
}

export function markAsRead(): StreamAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;
    const streamState$ = state$.get('streamState');

    return streamState$.mutate(async (state) => {
      const { session, stream } = state;

      if (
        session === null ||
        stream === null ||
        session.readPosition < 0 ||
        session.readPosition >= stream.items.length
      ) {
        return;
      }

      state.markerUpdating = true;

      try {
        const lastReadEntry = stream.items[session.readPosition]!;
        const credential = await acquireCredential(context);

        switch (getStreamType(session.id)) {
          case 'category':
            await feedlyClient.updateMarkers(credential.accessToken, {
              action: 'markAsRead',
              type: 'categories',
              categoryIds: [session.id],
              lastReadEntryId: lastReadEntry.id,
            });
            break;
          case 'feed':
            await feedlyClient.updateMarkers(credential.accessToken, {
              action: 'markAsRead',
              type: 'feeds',
              feedIds: [session.id],
              lastReadEntryId: lastReadEntry.id,
            });
            break;
          case 'tag':
            await feedlyClient.updateMarkers(credential.accessToken, {
              action: 'markAsRead',
              type: 'tags',
              tagIds: [session.id],
              lastReadEntryId: lastReadEntry.id,
            });
            break;
        }
      } finally {
        state.markerUpdating = false;
      }
    });
  };
}

export function startSettion(streamId: string): StreamAction<Promise<void>> {
  return ({ state$, persistentStore }) => {
    const streamState$ = state$.get('streamState');

    return streamState$.mutate(async (state) => {
      const {
        defaultSettings,
        feed,
        maxSessions,
        session: oldSession,
        stream,
      } = state;
      let { pastSessions } = state;

      const index = pastSessions.findIndex(
        (pastSession) => pastSession.id === streamId,
      );
      let newSession: StreamSession;

      if (index >= 0) {
        const pastSession = pastSessions[index]!;
        newSession = {
          ...pastSession,
          settings: pastSession.settings,
        };
        pastSessions = pastSessions.toSpliced(index, 1);
      } else {
        newSession = {
          id: streamId,
          readPosition: -1,
          scrollPosition: -1,
          settings: defaultSettings,
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

function getStreamType(streamId: string): 'category' | 'feed' | 'tag' | null {
  return (streamId.match(STREAM_ID_PATTERN)?.groups?.['type'] ??
    null) as ReturnType<typeof getStreamType>;
}

function guessStreamTitle(streamId: string): string {
  return streamId.match(STREAM_ID_PATTERN)?.groups?.['title'] ?? 'No Title';
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
