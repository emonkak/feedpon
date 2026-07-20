import type * as feedly from '@feedpon/feedly-client';
import type { PersistentStorage } from '@feedpon/foundation';
import {
  type Action,
  ImmutableMap,
  type Mutex,
  Store,
} from '@feedpon/foundation';
import type * as hatenaBookmark from '@feedpon/hatena-bookmark-client';
import type * as wedata from '@feedpon/wedata-client';
import type { HookObject, RenderContext } from 'barebind';
import type { Reactive } from 'barebind/addons/signal';
import {
  type Comparer,
  orderByAscending,
  orderByDescending,
} from './utils/comparing.ts';
import { stripTags } from './utils/stripTags.ts';

const STREAM_ID_PATTERN =
  /^(?<type>feed)\/(?<url>.*)|^user\/[^/]*\/(?<type>category|tag)\/(?<label>[^/]*)/;

export type AppAction<TResult> = Action<AppState, AppContext, TResult>;

export interface AppContext {
  feedlyAuthMutex: Mutex;
  feedlyAuthenticator: Authenticator;
  feedlyClient: feedly.FeedlyClient;
  hatenaBookmarkClient: hatenaBookmark.HatenaBookmarkClient;
  scrollController: ScrollController;
  state$: Reactive<AppState>;
  stateRepository: AppStateRepository;
  wedataClient: wedata.WedataClient;
}

export interface AppStateRepository extends PersistentStorage {
  addFeed(feed: Feed): Promise<void>;
  addStream(stream: Stream): Promise<void>;
  deleteAllFeeds(): Promise<void>;
  deleteAllStreams(): Promise<void>;
  deleteFeed(id: string): Promise<void>;
  deleteStream(id: string): Promise<void>;
  findFeed(id: string): Promise<Feed | null>;
  findStream(id: string): Promise<Stream | null>;
}

export class AppStore
  extends Store<AppState, AppContext>
  implements HookObject<void>
{
  static onUse(context: RenderContext): AppStore {
    const value = context.inject(AppStore);

    if (!(value instanceof AppStore)) {
      throw new Error('AppStore is not registered in this context.');
    }

    return value;
  }

  onUse(context: RenderContext): void {
    context.provide(this);
  }
}

export class AppState {
  authenticating: boolean = false;
  categories: ImmutableMap<Category['id'], Category> = ImmutableMap.empty();
  credential: feedly.FeedlyCredential | null = null;
  defaultSessionSettings: SessionSettings = {
    count: 50,
    layout: 'full',
    ranked: 'newest',
    unreadOnly: true,
  };
  feed: Feed | null = null;
  keyboardSettings: KeyboardSettings = {
    openLinksInBackground: true,
    scrollDistanceRatio: 0.5,
    scrollDuration: 166.6,
    scrollEasingCoordinates: [0.55, 0.055, 0.675, 0.19],
  };
  keyboardShortcuts: KeyboardShortcut[] = [
    {
      keyStrokes: [{ key: 'Space', modifiers: Modifier.None }],
      commandId: 'scrollDown',
    },
    {
      keyStrokes: [{ key: 'Space', modifiers: Modifier.Shift }],
      commandId: 'scrollUp',
    },
    {
      keyStrokes: [{ key: '/', modifiers: Modifier.None }],
      commandId: 'focusSearchBox',
    },
    {
      keyStrokes: [{ key: '?', modifiers: Modifier.None }],
      commandId: 'toggleKeyboardShortcuts',
    },
    {
      keyStrokes: [{ key: 'A', modifiers: Modifier.None }],
      commandId: 'selectPreviousCategory',
    },
    {
      keyStrokes: [{ key: 'G', modifiers: Modifier.None }],
      commandId: 'goToBottom',
    },
    {
      keyStrokes: [{ key: 'R', modifiers: Modifier.None }],
      commandId: 'reloadStream',
    },
    {
      keyStrokes: [{ key: 'S', modifiers: Modifier.None }],
      commandId: 'selectNextCategory',
    },
    {
      keyStrokes: [{ key: 'S', modifiers: Modifier.None }],
      commandId: 'selectNextCategory',
    },
    {
      keyStrokes: [{ key: 'V', modifiers: Modifier.None }],
      commandId: 'openWebsite',
    },
    {
      keyStrokes: [{ key: 'a', modifiers: Modifier.None }],
      commandId: 'selectPreviousSubscription',
    },
    {
      keyStrokes: [{ key: 'b', modifiers: Modifier.None }],
      commandId: 'toggleHatenaBookmarkEntry',
    },
    {
      keyStrokes: [{ key: 'c', modifiers: Modifier.None }],
      commandId: 'toggleStreamLayout',
    },
    {
      keyStrokes: [{ key: 'f', modifiers: Modifier.None }],
      commandId: 'toggleFullContents',
    },
    {
      keyStrokes: [
        { key: 'g', modifiers: Modifier.None },
        { key: 'g', modifiers: Modifier.None },
      ],
      commandId: 'goToTop',
    },
    {
      keyStrokes: [
        { key: 'g', modifiers: Modifier.None },
        { key: 'm', modifiers: Modifier.None },
      ],
      commandId: 'markStreamAsRead',
    },
    {
      keyStrokes: [{ key: 'h', modifiers: Modifier.None }],
      commandId: 'shrinkEntry',
    },
    {
      keyStrokes: [{ key: 'j', modifiers: Modifier.None }],
      commandId: 'selectNextEntry',
    },
    {
      keyStrokes: [{ key: 'k', modifiers: Modifier.None }],
      commandId: 'selectPreviousEntry',
    },
    {
      keyStrokes: [{ key: 'l', modifiers: Modifier.None }],
      commandId: 'expandEntry',
    },
    {
      keyStrokes: [{ key: 's', modifiers: Modifier.None }],
      commandId: 'selectNextSubscription',
    },
    {
      keyStrokes: [{ key: 'v', modifiers: Modifier.None }],
      commandId: 'openArticle',
    },
    {
      keyStrokes: [{ key: 'z', modifiers: Modifier.None }],
      commandId: 'toggleSidebar',
    },
  ];
  keyboardShortcutsOpened: boolean = false;
  muteFilters: MuteFilter[] = [];
  notifications: Notification[] = [];
  notificationSettings: NotificationSettings = { timeout: 3000 };
  opmlImporting: boolean = false;
  osd: Osd | null = null;
  pastSessions: Session[] = [];
  profile: Profile | null = null;
  profileLoading: boolean = false;
  readCounts: ImmutableMap<UnreadCount['id'], number> = ImmutableMap.empty();
  searchQuery: string = '';
  searchResults: SearchResult[] | null = null;
  searching: boolean = false;
  session: Session | null = null;
  sidebarOpened: boolean = true;
  siteinfos: Siteinfo[] = [];
  siteinfosUpdated: number = -1;
  stream: Stream | null = null;
  streamLoading: boolean = false;
  streamSettings: StreamSettings = {
    maxSessions: 20,
  };
  streamUpdating: boolean = false;
  subscriptions: ImmutableMap<Subscription['id'], Subscription> =
    ImmutableMap.empty();
  subscriptionsLoading: boolean = false;
  subscriptionsSettings: SubscriptionsSettings = {
    onlyUnread: true,
    ordering: 'id',
  };
  subscriptionsUpdated: number = -1;
  theme: Theme = 'light';
  unreadCounts: ImmutableMap<UnreadCount['id'], number> = ImmutableMap.empty();
  urlFilters: URLFilter[] = [
    {
      pattern: '[?&]utm_(?:source|medium|term|content|campaign)=[^&]*',
      replacement: '',
      flags: 'g',
    },
    {
      pattern: '\\?rss$',
      replacement: '',
      flags: '',
    },
  ];
  userStyle: string = '';
  version: number = 1;

  get allCategory(): Category | null {
    return this.credential !== null
      ? { id: toAllCategoryId(this.credential.id), label: 'All' }
      : null;
  }

  get pinTag(): Tag | null {
    return this.credential !== null
      ? { id: toPinTagId(this.credential.id), label: 'Pins' }
      : null;
  }

  get subscriptionsTree(): SubscriptionsTree {
    const { readCounts, subscriptions, subscriptionsSettings, unreadCounts } =
      this;
    const { onlyUnread, ordering } = subscriptionsSettings;
    const sortedSubscriptions = subscriptions
      .values()
      .toArray()
      .sort(getSubscriptionsComparer(ordering));
    const subscriptionGroups = new Map<string, SubscriptionGroup>();
    const ungroupedItems: SubscriptionItem[] = [];

    for (let i = 0, l = sortedSubscriptions.length; i < l; i++) {
      const subscription = sortedSubscriptions[i]!;
      const unreadCount = unreadCounts.get(subscription.id) ?? 0;
      const readCount = readCounts.get(subscription.id) ?? 0;

      if (onlyUnread && unreadCount === 0) {
        continue;
      }

      const subscriptionItem = { readCount, subscription, unreadCount };

      if (subscription.categories.length > 0) {
        for (let j = 0, m = subscription.categories.length; j < m; j++) {
          const category = subscription.categories[j]!;
          const subscriptionGroup = subscriptionGroups.get(category.id);

          if (subscriptionGroup !== undefined) {
            subscriptionGroup.subscriptionItems.push(subscriptionItem);
            subscriptionGroup.unreadCount += unreadCount;
            subscriptionGroup.readCount += readCount;
          } else {
            subscriptionGroups.set(category.id, {
              category,
              subscriptionItems: [subscriptionItem],
              unreadCount,
              readCount,
            });
          }
        }
      } else {
        ungroupedItems.push(subscriptionItem);
      }
    }

    return {
      subscriptionGroups: subscriptionGroups
        .values()
        .toArray()
        .sort(orderByAscending(({ category }) => category.label)),
      ungroupedItems,
    };
  }

  get totalUnreadCount(): number {
    const unreadCount = this.unreadCounts
      .values()
      .reduce((totalCount, count) => totalCount + count, 0);
    const readCount = this.readCounts
      .values()
      .reduce((totalCount, count) => totalCount + count, 0);
    return Math.max(unreadCount - readCount, 0);
  }

  get unsortedCategories(): Category[] {
    return this.categories.values().toArray();
  }

  get unsortedSubscriptions(): Subscription[] {
    return this.subscriptions.values().toArray();
  }
}

export type AuthCode = string;

export interface Authenticator {
  authenticate(authenticationUrl: string, redirectUrl: string): Promise<string>;
}

export type Category = feedly.Category;

export interface CommandHandler {
  expandEntry(): AppAction<void>;
  focusSearchBox(): AppAction<void>;
  goToBottom(): AppAction<void>;
  goToTop(): AppAction<void>;
  markStreamAsRead(): AppAction<void>;
  openArticle(): AppAction<void>;
  openWebsite(): AppAction<void>;
  reloadStream(): AppAction<void>;
  reloadSubscriptions(): AppAction<void>;
  scrollDown(): AppAction<void>;
  scrollUp(): AppAction<void>;
  selectNextCategory(): AppAction<void>;
  selectNextEntry(): AppAction<void>;
  selectNextSubscription(): AppAction<void>;
  selectPreviousCategory(): AppAction<void>;
  selectPreviousEntry(): AppAction<void>;
  selectPreviousSubscription(): AppAction<void>;
  shrinkEntry(): AppAction<void>;
  toggleFullContents(): AppAction<void>;
  toggleHatenaBookmarkEntry(): AppAction<void>;
  toggleKeyboardShortcuts(): AppAction<void>;
  toggleSidebar(): AppAction<void>;
  toggleStreamLayout(): AppAction<void>;
}

export type CommandId = keyof CommandHandler;

export interface Entry extends feedly.Entry {
  fullContents?: FullContent[];
  fullContentsLoading?: boolean;
  fullContentsShown?: boolean;
  hatenaBookmarkCount?: number;
  hatenaBookmarkEntry?: hatenaBookmark.Entry | null;
  hatenaBookmarkEntryLoading?: boolean;
  hatenaBookmarkEntryShown?: boolean;
}

export type EntryRanking = feedly.EntryRanking;

export type Feed = feedly.Feed;

export interface FullContent {
  url: string;
  content: string;
  nextUrl: string | null;
}

export interface KeyboardSettings {
  openLinksInBackground: boolean;
  scrollDistanceRatio: number;
  scrollDuration: number;
  scrollEasingCoordinates: ScrollEasingCoordinates;
}

export interface KeyStroke {
  key: string;
  modifiers: Modifiers;
}

export interface KeyboardShortcut {
  keyStrokes: KeyStroke[];
  commandId: CommandId;
}

export type Modifiers = number;

export const Modifier = {
  None: 0,
  Shift: 0b1,
  Alt: 0b10,
  Control: 0b100,
  Meta: 0b1000,
} as const;

export interface MuteFilter {
  keyword: string;
  targets: MuteTarget[];
}

export type MuteTarget = 'title' | 'content' | 'tag';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timeout: number;
}

export interface NotificationSettings {
  timeout: number;
}

export type NotificationType = 'info' | 'positive' | 'negative';

export interface Osd {
  message: string;
  timeout: number;
}

export type ParsedStreamId =
  | { type: 'category'; label: string }
  | { type: 'feed'; url: string }
  | { type: 'tag'; label: string }
  | { type: 'unknown' };

export type SearchResult = feedly.SearchResult;

export type ScrollEasingCoordinates = [
  x1: number,
  y1: number,
  x2: number,
  y2: number,
];

export type ScrollEasingFunction = (t: number) => number;

export type ScrollTarget = Window | Element;

export interface ScrollController {
  scrollTo(
    target: ScrollTarget,
    x: number,
    y: number,
    duration: number,
    easing: ScrollEasingFunction,
  ): Promise<void>;
  scrollBy(
    target: ScrollTarget,
    dx: number,
    dy: number,
    duration: number,
    easing: ScrollEasingFunction,
  ): Promise<void>;
  scrollIntoView(
    target: Element,
    duration: number,
    easing: ScrollEasingFunction,
  ): Promise<void>;
  waitForScroll(target: ScrollTarget): Promise<void>;
}

export type Siteinfo = wedata.DatabaseItem<wedata.AutoPagerizeData>;

export interface Stream extends feedly.Stream {
  items: Entry[];
}

export type StreamLayout = 'full' | 'compact';

export interface StreamSettings {
  maxSessions: number;
}

export interface Session {
  expandedIndex: number;
  focusIndex: number;
  id: string;
  readIndex: number;
  settings: SessionSettings;
  title: string;
  updated: number;
}

export interface SessionSettings {
  count: number;
  layout: StreamLayout;
  ranked: EntryRanking;
  unreadOnly: boolean;
}

export type Subscription = feedly.Subscription;

export interface SubscriptionGroup {
  category: Category;
  subscriptionItems: SubscriptionItem[];
  readCount: number;
  unreadCount: number;
}

export interface SubscriptionItem {
  readCount: number;
  subscription: Subscription;
  unreadCount: number;
}

export type SubscriptionsOrdering = 'id' | 'title' | 'newest' | 'oldest';

export interface SubscriptionsSettings {
  onlyUnread: boolean;
  ordering: SubscriptionsOrdering;
}

export interface SubscriptionsTree {
  subscriptionGroups: SubscriptionGroup[];
  ungroupedItems: SubscriptionItem[];
}

export type Tag = feedly.Tag;

export type Theme = 'system' | 'light' | 'dark';

export interface URLFilter {
  flags: string;
  pattern: string;
  replacement: string;
}

export type UnreadCount = feedly.UnreadCount;

export type Profile = feedly.Profile;

export function getEntryContent(entry: Entry): string {
  return entry.content?.content ?? entry.summary?.content ?? '';
}

export function getEntrySummary(entry: Entry): string {
  return stripTags(entry.summary?.content ?? '');
}

export function getEntryUrl(entry: Entry): string {
  return (
    entry.canonicalUrl ??
    entry.alternate?.find((link) => link.type === 'text/html')?.href ??
    entry.origin.htmlUrl
  );
}

export function getFeedUrl(feedId: string): string {
  const parsedId = parseStreamId(feedId);
  return parsedId.type === 'feed' ? parsedId.url : '#';
}

export function parseStreamId(streamId: string): ParsedStreamId {
  const groups = streamId.match(STREAM_ID_PATTERN)?.groups;

  switch (groups?.['type']) {
    case 'category':
    case 'tag':
      return {
        type: groups['type'],
        label: groups['label']!,
      };
    case 'feed':
      return {
        type: groups['type'],
        url: groups['url']!,
      };
    default:
      return { type: 'unknown' };
  }
}

function getSubscriptionsComparer(
  ordering: SubscriptionsOrdering,
): Comparer<Subscription> {
  switch (ordering) {
    case 'id':
      return orderByAscending((subscription) => subscription.id);
    case 'title':
      return orderByAscending((subscription) => subscription.title);
    case 'newest':
      return orderByDescending((subscription) => subscription.updated);
    case 'oldest':
      return orderByAscending((subscription) => subscription.updated);
  }
}

function toAllCategoryId(userId: string): string {
  return `user/${userId}/category/global.all`;
}

function toPinTagId(userId: string): string {
  return `user/${userId}/tag/global.saved`;
}
