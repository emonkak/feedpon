import { History } from 'history';

import { CacheMap } from 'utils/containers/CacheMap';
import { Store as FluxStore } from 'utils/flux/types';
import { Trie } from 'utils/containers/Trie';

export type Store = FluxStore<State, Event> & {
    dispatch<TResult>(event: Thunk<TResult>): TResult;
};

export interface State {
    categories: Categories;
    credential: Credential;
    histories: Histories;
    instantNotifications: InstantNotifications;
    keyMappings: KeyMappings;
    notifications: Notifications;
    search: Search;
    sharedSiteinfo: SharedSiteinfo;
    streams: Streams;
    subscriptions: Subscriptions;
    trackingUrlPatterns: TrackingUrlPatterns;
    ui: UI;
    user: User;
    userSiteinfo: UserSiteinfo;
}

export type Event
    = { type: 'ACTIVE_ENTRY_CAHNGED', index: number }
    | { type: 'APPLICATION_INITIALIZED' }
    | { type: 'BOOKMARK_COUNTS_FETCHED', bookmarkCounts: { [url: string]: number } }
    | { type: 'CATEGORY_CREATED', category: Category }
    | { type: 'CATEGORY_CREATING' }
    | { type: 'CATEGORY_CREATING_FAILED' }
    | { type: 'CATEGORY_DELETED', categoryId: string | number, label: string }
    | { type: 'CATEGORY_DELETING', categoryId: string | number, label: string }
    | { type: 'CATEGORY_DELETING_FAILED', categoryId: string | number, label: string }
    | { type: 'CATEGORY_MARKED_AS_READ', categoryId: string | number, label: string }
    | { type: 'CATEGORY_MARKING_AS_READ', categoryId: string | number, label: string }
    | { type: 'CATEGORY_MARKING_AS_READ_FAILED', categoryId: string | number, label: string }
    | { type: 'CATEGORY_UPDATED', prevCategoryLabel: string, category: Category }
    | { type: 'CATEGORY_UPDATING', categoryId: string | number }
    | { type: 'CATEGORY_UPDATING_FAILED', categoryId: string | number }
    | { type: 'COMMENTS_FETCHED', entryId: string | number, comments: Comment[] }
    | { type: 'COMMENTS_FETCHING', entryId: string | number }
    | { type: 'COMMENTS_FETCHING_FAILED', entryId: string | number }
    | { type: 'DEFAULT_STREAM_OPTIONS_CHANGED', fetchOptions: StreamFetchOptions }
    | { type: 'ENTRIES_MARKED_AS_READ', entryIds: (string | number)[], readCounts: { [streamId: string]: number } }
    | { type: 'ENTRIES_MARKING_AS_READ', entryIds: (string | number)[] }
    | { type: 'ENTRIES_MARKING_AS_READ_FAILED', entryIds: (string | number)[] }
    | { type: 'ENTRY_PINNED', entryId: string | number, isPinned: boolean }
    | { type: 'ENTRY_PINNING', entryId: string | number }
    | { type: 'ENTRY_PINNING_FAILED', entryId: string | number }
    | { type: 'ENTRY_URLS_EXPANDED', urls: { [url: string]: string } }
    | { type: 'EXPANDED_ENTRY_CHANGED', index: number }
    | { type: 'FEED_MARKED_AS_READ', feedId: string | number }
    | { type: 'FEED_MARKING_AS_READ', feedId: string | number }
    | { type: 'FEED_MARKING_AS_READ_FAILED', feedId: string | number }
    | { type: 'FEED_SEARCHED', query: string, feeds: Feed[] }
    | { type: 'FEED_SEARCHING', query: string }
    | { type: 'FEED_SEARCHING_FAILED', query: string }
    | { type: 'FEED_SUBSCRIBED', subscription: Subscription }
    | { type: 'FEED_SUBSCRIBING', feedId: string | number }
    | { type: 'FEED_SUBSCRIBING_FAILED', feedId: string | number }
    | { type: 'FEED_UNSUBSCRIBED', feedId: string | number }
    | { type: 'FEED_UNSUBSCRIBING', feedId: string | number }
    | { type: 'FEED_UNSUBSCRIBING_FAILED', feedId: string | number }
    | { type: 'FULL_CONTENTS_HIDDEN', entryId: string | number }
    | { type: 'FULL_CONTENTS_SHOWN', entryId: string | number }
    | { type: 'FULL_CONTENT_FETCHED', entryId: string | number, fullContent: FullContent }
    | { type: 'FULL_CONTENT_FETCHING', entryId: string | number }
    | { type: 'FULL_CONTENT_FETCHING_FAILED', entryId: string | number }
    | { type: 'INSTANT_NOTIFICATION_DISMISSED' }
    | { type: 'INSTANT_NOTIFICATION_SENT', instantNotification: InstantNotification }
    | { type: 'KEY_MAPPING_ADDED', keySequence: string, commandId: string }
    | { type: 'KEY_MAPPING_REMOVED', keySequence: string, commandId: string }
    | { type: 'MORE_ENTRIES_FETCHED', streamId: string, continuation: string | null, entries: Entry[] }
    | { type: 'MORE_ENTRIES_FETCHING', streamId: string }
    | { type: 'MORE_ENTRIES_FETCHING_FAILED', streamId: string }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'READ_ENTRY_CHANGED', index: number }
    | { type: 'SCROLL_ENDED' }
    | { type: 'SCROLL_STARTED' }
    | { type: 'SCROLL_AMOUNT_CHANGED', scrollAmount: number }
    | { type: 'SIDEBAR_CLOSED' }
    | { type: 'SIDEBAR_OPENED' }
    | { type: 'SITEINFO_UPDATED', items: SiteinfoItem[], updatedAt: number }
    | { type: 'SITEINFO_UPDATING' }
    | { type: 'SITEINFO_UPDATING_FAILED' }
    | { type: 'STREAM_CACHE_CAPACITY_CHANGED', capacity: number }
    | { type: 'STREAM_CACHE_LIFETIME_CHANGED', lifetime: number }
    | { type: 'STREAM_FETCHED', stream: Stream  }
    | { type: 'STREAM_FETCHING', streamId: string, fetchOptions: StreamFetchOptions, fetchedAt: number }
    | { type: 'STREAM_FETCHING_FAILED', streamId: string, fetchOptions: StreamFetchOptions, fetchedAt: number }
    | { type: 'STREAM_HISTORY_OPTIONS_CHANGED', numStreamHistories: number }
    | { type: 'STREAM_SELECTED', streamId: string  }
    | { type: 'STREAM_UNSELECTED'  }
    | { type: 'STREAM_VIEW_CHANGED', streamView: StreamViewKind }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], fetchedAt: number }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'SUBSCRIPTIONS_FETCHING_FAILED' }
    | { type: 'SUBSCRIPTIONS_ORDER_CHANGED', order: SubscriptionOrderKind }
    | { type: 'SUBSCRIPTIONS_UNREAD_VIEWING_CHANGED', onlyUnread: boolean }
    | { type: 'THEME_CHANGED', theme: ThemeKind }
    | { type: 'TOKEN_RECEIVED', authorizedAt: number, token: any }
    | { type: 'TOKEN_RECEIVING' }
    | { type: 'TOKEN_RECEIVING_FAILED' }
    | { type: 'TOKEN_REVOKED' }
    | { type: 'TOKEN_REVOKING' }
    | { type: 'TRACKING_URL_PATTERN_ADDED', pattern: string }
    | { type: 'TRACKING_URL_PATTERN_REMOVED', pattern: string }
    | { type: 'UNREAD_KEEPING_CHANGED', keepUnread: boolean }
    | { type: 'USER_FETCHED', profile: Profile }
    | { type: 'USER_FETCHING' }
    | { type: 'USER_FETCHING_FAILED' }
    | { type: 'USER_SITEINFO_ITEM_ADDED', item: SiteinfoItem }
    | { type: 'USER_SITEINFO_ITEM_REMOVED', id: string | number }
    | { type: 'USER_SITEINFO_ITEM_UPDATED', item: SiteinfoItem };

export type Thunk<TResult = void> = (store: Store, context: ThunkContext) => TResult;

export type AsyncThunk<TResult = void> = Thunk<Promise<TResult>>;

export interface ThunkContext {
    environment: Environment;
    router: History;
    selectors: Selectors;
}

export interface Environment {
    clientId: string;
    clientSecret: string;
    scope: string;
    redirectUri: string;
}

export interface Selectors {
    visibleSubscriptionsSelector: (state: State) => Subscription[];
    sortedCategoriesSelector: (state: State) => Category[];
}

export interface Command {
    thunk: Thunk<any>;
    title: string;
    skipNotification?: boolean;
}

export interface Credential {
    authorizedAt: number;
    isLoading: boolean;
    token: object | null;
    version: number;
}

export interface Profile {
    picture: string;
    source: string;
    userId: string;
}

export interface Search {
    feeds: Feed[];
    isLoaded: boolean;
    isLoading: boolean;
    query: string;
    version: number;
}

export interface Categories {
    isLoading: boolean;
    items: { [streamId: string]: Category };
    version: number;
}

export interface Category {
    categoryId: string | number;
    streamId: string;
    label: string;
    isLoading: boolean;
}

export interface Streams {
    cacheLifetime: number;
    defaultFetchOptions: StreamFetchOptions;
    isLoaded: boolean;
    isLoading: boolean;
    isMarking: boolean;
    items: CacheMap<Stream>;
    keepUnread: boolean;
    version: number;
}

export interface Stream {
    streamId: string;
    title: string;
    fetchedAt: number;
    entries: Entry[];
    continuation: string | null;
    feed: Feed | null;
    category: Category | null;
    fetchOptions: StreamFetchOptions;
}

export interface StreamFetchOptions {
    entryOrder: EntryOrderKind;
    numEntries: number;
    onlyUnread: boolean;
}

export type EntryOrderKind = 'newest' | 'oldest';

export type StreamViewKind = 'expanded' | 'collapsible';

export interface Feed {
    feedId: string | number;
    streamId: string;
    title: string;
    description: string;
    url: string;
    feedUrl: string;
    iconUrl: string;
    subscribers: number;
    isLoading: boolean;
}

export interface Entry {
    entryId: string | number;
    title: string;
    author: string;
    url: string;
    summary: string;
    content: string;
    publishedAt: number;
    bookmarkCount: number;
    isPinned: boolean;
    isPinning: boolean;
    markedAsRead: boolean;
    origin: Origin | null;
    fullContents: FullContents;
    comments: Comments;
}

export type EntryPopoverKind = 'none' | 'comment' | 'share';

export interface Origin {
    streamId: string;
    title: string;
    url: string;
}

export interface Visual {
    url: string;
    width: number;
    height: number;
}

export interface FullContents {
    isLoaded: boolean;
    isLoading: boolean;
    isShown: boolean;
    items: FullContent[];
}

export interface FullContent {
    url: string;
    content: string;
    nextPageUrl: string;
}

export interface Comments {
    isLoaded: boolean;
    isLoading: boolean;
    items: Comment[];
}

export interface Comment {
    user: string;
    comment: string;
    timestamp: string;
}

export interface InstantNotifications {
    item: InstantNotification | null;
    version: number;
}

export interface InstantNotification {
    dismissAfter: number;
    message: string;
}

export interface Notifications {
    items: Notification[];
    version: number;
}

export interface Notification {
    id: number;
    dismissAfter: number;
    message: string;
    kind: NotificationKind;
}

export type NotificationKind = 'default' | 'positive' | 'negative';

export interface TrackingUrlPatterns {
    items: string[];
    version: number;
}

export interface Subscriptions {
    isLoading: boolean;
    items: { [streamId: string]: Subscription };
    lastUpdatedAt: number;
    onlyUnread: boolean;
    order: SubscriptionOrderKind;
    version: number;
}

export interface Subscription {
    subscriptionId: string | number;
    streamId: string;
    feedId: string | number;
    title: string;
    labels: string[];
    url: string;
    feedUrl: string;
    iconUrl: string;
    unreadCount: number;
    updatedAt: number;
    isLoading: boolean;
}

export type SubscriptionOrderKind = 'id' | 'title' | 'newest' | 'oldest';

export interface GroupedSubscription {
    items: Subscription[];
    unreadCount: number;
}

export interface UserSiteinfo {
    items: SiteinfoItem[];
    version: number;
}

export interface SharedSiteinfo {
    items: SiteinfoItem[];
    lastUpdatedAt: number;
    isLoading: boolean;
    version: number;
}

export interface SiteinfoItem {
    id: string | number;
    name: string;
    urlPattern: string;
    contentExpression: string;
    nextLinkExpression: string;
}

export interface User {
    isLoaded: boolean;
    isLoading: boolean;
    profile: Profile;
    version: number;
}

export interface UI {
    activeEntryIndex: number;
    expandedEntryIndex: number;
    isScrolling: boolean;
    readEntryIndex: number;
    selectedStreamId: string;
    sidebarIsOpened: boolean;
    streamView: StreamViewKind;
    theme: ThemeKind;
    version: number;
}

export interface Histories {
    recentlyReadStreams: CacheMap<number>;
    version: number;
}

export type ThemeKind = 'theme-light' | 'theme-dark';

export interface KeyMappings {
    items: Trie<string>;
    scrollAmount: number;
    version: number;
}
