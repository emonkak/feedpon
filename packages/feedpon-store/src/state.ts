import type * as v from 'valibot';

import type {
  Category,
  Entry,
  Feed,
  FeedlyCredential,
  GetStreamContentsRequest,
  Profile,
  SearchResult,
  Stream,
  Subscription,
  Tag,
  UnreadCount,
} from './apis/feedly.ts';
import type {
  Bookmark as HatenaBookmarkBookmark,
  Entry as HatenaBookmarkEntry,
} from './apis/hatenaBookmark.ts';
import type { AutoPagerizeData, DatabaseItem } from './apis/wedata.ts';
import { ImmutableMap } from './collections/ImmutableMap.ts';
import {
  type Comparer,
  orderByAscending,
  orderByDescending,
} from './utils/compare.ts';
import { stripTags } from './utils/stripTags.ts';

const STREAM_ID_PATTERN =
  /^(?<type>feed)\/(?<url>.*)|^user\/[^/]*\/(?<type>category|tag)\/(?<label>[^/]*)/;

export type Category = v.InferOutput<typeof Category>;

export interface CommandHandler<TContext> {
  expandEntry(context: TContext): void;
  focusSearchBox(context: TContext): void;
  goToBottom(context: TContext): void;
  goToTop(context: TContext): void;
  markStreamAsRead(context: TContext): void;
  openArticle(context: TContext): void;
  openWebsite(context: TContext): void;
  reloadStream(context: TContext): Promise<void>;
  reloadSubscriptions(context: TContext): Promise<void>;
  scrollDown(context: TContext): void;
  scrollUp(context: TContext): void;
  selectNextCategory(context: TContext): void;
  selectNextEntry(context: TContext): void;
  selectNextSubscription(context: TContext): void;
  selectPreviousCategory(context: TContext): void;
  selectPreviousEntry(context: TContext): void;
  selectPreviousSubscription(context: TContext): void;
  shrinkEntry(context: TContext): void;
  toggleFullContents(context: TContext): void;
  toggleHatenaBookmarkEntry(context: TContext): void;
  toggleKeyboardShortcuts(context: TContext): void;
  toggleSidebar(context: TContext): void;
  toggleStreamLayout(context: TContext): void;
}

export type CommandId = keyof CommandHandler<unknown>;

export interface Entry extends v.InferOutput<typeof Entry> {
  fullContents?: FullContent[];
  fullContentsLoading?: boolean;
  fullContentsShown?: boolean;
  hatenaBookmarkCount?: number;
  hatenaBookmarkEntry?: HatenaBookmarkEntry | null;
  hatenaBookmarkEntryLoading?: boolean;
  hatenaBookmarkEntryShown?: boolean;
}

export type EntriesOrdering = NonNullable<GetStreamContentsRequest['ranked']>;

export type Feed = v.InferOutput<typeof Feed>;

export interface FullContent {
  url: string;
  content: string;
  nextUrl: string | null;
}

export type HatenaBookmarkBookmark = v.InferOutput<
  typeof HatenaBookmarkBookmark
>;

export type HatenaBookmarkEntry = v.InferOutput<typeof HatenaBookmarkEntry>;

export interface KeyboardSettings {
  openLinksInBackground: boolean;
  scrollDistanceRatio: number;
  scrollDuration: number;
}

export interface KeyStroke {
  key: string;
  modifiers: Modifiers;
}

export interface KeyboardShortcut {
  keyStorokes: KeyStroke[];
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

export type SearchResult = v.InferOutput<typeof SearchResult>;

export type Siteinfo = DatabaseItem<AutoPagerizeData>;

export interface Stream extends v.InferOutput<typeof Stream> {
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
  ranked: EntriesOrdering;
  unreadOnly: boolean;
}

export type Subscription = v.InferOutput<typeof Subscription>;

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

export type Tag = v.InferOutput<typeof Tag>;

export type Theme = 'system' | 'light' | 'dark';

export interface URLFilter {
  flags: string;
  pattern: string;
  replacement: string;
}

export type UnreadCount = v.InferOutput<typeof UnreadCount>;

export type Profile = v.InferOutput<typeof Profile>;

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
    openLinksInBackground: true,
    scrollDistanceRatio: 0.5,
    scrollDuration: (1000 / 60) * 10,
  };
  keyboardShortcuts: KeyboardShortcut[] = [
    {
      keyStorokes: [{ key: 'Space', modifiers: Modifier.None }],
      commandId: 'scrollDown',
    },
    {
      keyStorokes: [{ key: 'Space', modifiers: Modifier.Shift }],
      commandId: 'scrollUp',
    },
    {
      keyStorokes: [{ key: '/', modifiers: Modifier.None }],
      commandId: 'focusSearchBox',
    },
    {
      keyStorokes: [{ key: '?', modifiers: Modifier.None }],
      commandId: 'toggleKeyboardShortcuts',
    },
    {
      keyStorokes: [{ key: 'A', modifiers: Modifier.None }],
      commandId: 'selectPreviousCategory',
    },
    {
      keyStorokes: [{ key: 'G', modifiers: Modifier.None }],
      commandId: 'goToBottom',
    },
    {
      keyStorokes: [{ key: 'R', modifiers: Modifier.None }],
      commandId: 'reloadStream',
    },
    {
      keyStorokes: [{ key: 'S', modifiers: Modifier.None }],
      commandId: 'selectNextCategory',
    },
    {
      keyStorokes: [{ key: 'S', modifiers: Modifier.None }],
      commandId: 'selectNextCategory',
    },
    {
      keyStorokes: [{ key: 'V', modifiers: Modifier.None }],
      commandId: 'openWebsite',
    },
    {
      keyStorokes: [{ key: 'a', modifiers: Modifier.None }],
      commandId: 'selectPreviousSubscription',
    },
    {
      keyStorokes: [{ key: 'b', modifiers: Modifier.None }],
      commandId: 'toggleHatenaBookmarkEntry',
    },
    {
      keyStorokes: [{ key: 'c', modifiers: Modifier.None }],
      commandId: 'toggleStreamLayout',
    },
    {
      keyStorokes: [{ key: 'f', modifiers: Modifier.None }],
      commandId: 'toggleFullContents',
    },
    {
      keyStorokes: [
        { key: 'g', modifiers: Modifier.None },
        { key: 'g', modifiers: Modifier.None },
      ],
      commandId: 'goToTop',
    },
    {
      keyStorokes: [
        { key: 'g', modifiers: Modifier.None },
        { key: 'm', modifiers: Modifier.None },
      ],
      commandId: 'markStreamAsRead',
    },
    {
      keyStorokes: [{ key: 'h', modifiers: Modifier.None }],
      commandId: 'shrinkEntry',
    },
    {
      keyStorokes: [{ key: 'j', modifiers: Modifier.None }],
      commandId: 'selectNextEntry',
    },
    {
      keyStorokes: [{ key: 'k', modifiers: Modifier.None }],
      commandId: 'selectPreviousEntry',
    },
    {
      keyStorokes: [{ key: 'l', modifiers: Modifier.None }],
      commandId: 'expandEntry',
    },
    {
      keyStorokes: [{ key: 's', modifiers: Modifier.None }],
      commandId: 'selectNextSubscription',
    },
    {
      keyStorokes: [{ key: 'v', modifiers: Modifier.None }],
      commandId: 'openArticle',
    },
    {
      keyStorokes: [{ key: 'z', modifiers: Modifier.None }],
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
