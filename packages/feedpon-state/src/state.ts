import type * as v from 'valibot';

import type {
  Category,
  Entry,
  Feed,
  FeedlyCredential,
  GetStreamContentsRequest,
  SearchResult,
  Stream,
  Subscription,
  Tag,
  UnreadCount,
  UserProfile,
} from './apis/feedly.ts';
import type { BookmarkEntry } from './apis/hatenaBookmark.ts';
import type { AutoPagerizeItem } from './apis/wedata.ts';
import { ImmutableMap } from './collections/ImmutableMap.ts';
import {
  type Comparer,
  orderByAscending,
  orderByDescending,
} from './utils/compare.ts';

export type Category = v.InferOutput<typeof Category>;

export type Command<TContext, TResult> = (context: TContext) => TResult;

export interface CommandHandler<TContext> {
  scrollDown: Command<TContext, void>;
  scrollUp: Command<TContext, void>;
}

export type CommandId = keyof CommandHandler<unknown>;

export interface Entry extends v.InferOutput<typeof Entry> {
  fullContents?: FullContent[];
  fullContentsLoading?: boolean;
  fullContentsShown?: boolean;
  hatenaBookmark?: HatenaBookmarkEntry;
  hatenaBookmarkCount?: number;
  hatenaBookmarkLoading?: boolean;
  hatenaBookmarkShown?: boolean;
}

export type EntryOrdering = GetStreamContentsRequest['ranked'];

export type Feed = v.InferOutput<typeof Feed>;

export interface FullContent {
  url: string;
  content: string;
  nextUrl: string | null;
}

export type HatenaBookmarkEntry = v.InferOutput<typeof BookmarkEntry>;

export interface KeyboardSettings {
  scrollBehavior: ScrollBehavior;
  scrollDistanceRatio: number;
}

export interface KeyStroke {
  key: string;
  modifiers: Modifier[];
}

export interface KeyboardShortcut {
  keyStorokes: KeyStroke[];
  commandId: CommandId;
}

export type Modifier = 'alt' | 'control' | 'meta' | 'shift';

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

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type SearchResult = v.InferOutput<typeof SearchResult>;

export interface Session {
  expandedIndex: number;
  id: string;
  readIndex: number;
  scrollIndex: number;
  settings: SessionSettings;
  title: string;
}

export interface SessionSettings {
  count: number;
  layout: StreamLayout;
  ranked: EntryOrdering;
  unreadOnly: boolean;
}

export interface Siteinfo extends v.InferOutput<typeof AutoPagerizeItem> {}

export interface Stream extends v.InferOutput<typeof Stream> {
  items: Entry[];
}

export type StreamLayout = 'full' | 'compact';

export type Subscription = v.InferOutput<typeof Subscription>;

export interface SubscriptionGroup {
  category: Category;
  items: SubscriptionItem[];
  readCount: number;
  unreadCount: number;
}

export interface SubscriptionItem {
  readCount: number;
  subscription: Subscription;
  unreadCount: number;
}

export type SubscriptionOrdering = 'id' | 'title' | 'newest' | 'oldest';

export interface SubscriptionTree {
  subscriptionGroups: SubscriptionGroup[];
  ungroupedItems: SubscriptionItem[];
}

export type Tag = v.InferOutput<typeof Tag>;

export type Theme = 'system' | 'light' | 'dark';

export interface URLFilter {
  flags: string;
  pattern: string;
  replacement: string;
}

export type UnreadCount = v.InferOutput<typeof UnreadCount>;

export type UserProfile = v.InferOutput<typeof UserProfile>;

export interface SubscriptionsSettings {
  onlyUnread: boolean;
  order: SubscriptionOrdering;
}

export class AppState {
  authenticating: boolean = false;
  categories: ImmutableMap<Category['id'], Category> = ImmutableMap.empty();
  credential: FeedlyCredential | null = null;
  defaultSessionSettings: SessionSettings = {
    count: 50,
    layout: 'full',
    ranked: 'newest',
    unreadOnly: true,
  };
  feed: Feed | null = null;
  keyboardSettings: KeyboardSettings = {
    scrollBehavior: 'smooth',
    scrollDistanceRatio: 0.5,
  };
  keyboardShortcuts: KeyboardShortcut[] = [
    { keyStorokes: [{ key: ' ', modifiers: [] }], commandId: 'scrollDown' },
    {
      keyStorokes: [{ key: ' ', modifiers: ['shift'] }],
      commandId: 'scrollUp',
    },
  ];
  keyboardShortcutsShown: boolean = false;
  markerUpdating: boolean = false;
  maxSessions: number = 20;
  muteFilters: MuteFilter[] = [];
  notifications: Notification[] = [];
  notificationSettings: NotificationSettings = { timeout: 5 };
  opmlImporting: boolean = false;
  osd: string | null = null;
  pastSessions: Session[] = [];
  readCounts: ImmutableMap<UnreadCount['id'], number> = ImmutableMap.empty();
  searchResults: SearchResult[] = [];
  session: Session | null = null;
  sidebarShown: boolean = true;
  siteinfos: Siteinfo[] = [];
  siteinfosUpdated: number = -1;
  stream: Stream | null = null;
  streamLoading: boolean = false;
  subscriptions: ImmutableMap<Subscription['id'], Subscription> =
    ImmutableMap.empty();
  subscriptionsLoading: boolean = false;
  subscriptionsSettings: SubscriptionsSettings = {
    onlyUnread: true,
    order: 'id',
  };
  subscriptionsUpdated: number = -1;
  theme: Theme = 'light';
  unreadCounts: ImmutableMap<UnreadCount['id'], number> = ImmutableMap.empty();
  urlFilter: URLFilter[] = [];
  userProfile: UserProfile | null = null;
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

  get totalUnreadCount(): number {
    const unreadCount = this.unreadCounts
      .values()
      .reduce((totalCount, count) => totalCount + count, 0);
    const readCount = this.readCounts
      .values()
      .reduce((totalCount, count) => totalCount + count, 0);
    return Math.max(unreadCount - readCount, 0);
  }

  get sortedSubscriptions(): Subscription[] {
    return this.subscriptions
      .values()
      .toArray()
      .sort(getSubscriptionComparer(this.subscriptionsSettings.order));
  }

  get subscriptionTree(): SubscriptionTree {
    const {
      readCounts,
      sortedSubscriptions,
      subscriptionsSettings,
      unreadCounts,
    } = this;
    const subscriptionGroups = new Map<string, SubscriptionGroup>();
    const ungroupedItems: SubscriptionItem[] = [];

    for (let i = 0, l = sortedSubscriptions.length; i < l; i++) {
      const subscription = sortedSubscriptions[i]!;
      const unreadCount = unreadCounts.get(subscription.id) ?? 0;
      const readCount = readCounts.get(subscription.id) ?? 0;

      if (subscriptionsSettings.onlyUnread && unreadCount === 0) {
        continue;
      }

      const item = { readCount, subscription, unreadCount };

      if (subscription.categories.length > 0) {
        for (let j = 0, m = subscription.categories.length; j < m; j++) {
          const category = subscription.categories[i]!;
          const group = subscriptionGroups.get(category.id);

          if (group !== undefined) {
            group.items.push(item);
            group.unreadCount += unreadCount;
            group.readCount += readCount;
          } else {
            subscriptionGroups.set(category.id, {
              category,
              items: [item],
              unreadCount,
              readCount,
            });
          }
        }
      } else {
        ungroupedItems.push(item);
      }
    }

    return {
      subscriptionGroups: Array.from(subscriptionGroups.values()).sort(
        orderByAscending(({ category }) => category.label),
      ),
      ungroupedItems,
    };
  }
}

function getSubscriptionComparer(
  order: SubscriptionOrdering,
): Comparer<Subscription> {
  switch (order) {
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
