import { History } from 'history';

import { CacheMap } from 'utils/containers/CacheMap';
import { Store as FluxStore } from 'utils/flux/types';
import { Trie } from 'utils/containers/Trie';

export type Store = FluxStore<State, Event> & {
    dispatch<TResult>(event: Thunk<TResult>): TResult;
};

export interface State {
    backend: Backend;
    categories: Categories;
    histories: Histories;
    instantNotifications: InstantNotifications;
    keyMappings: KeyMappings;
    notifications: Notifications;
    search: Search;
    sharedSiteinfo: SharedSiteinfo;
    streams: Streams;
    subscriptions: Subscriptions;
    trackingUrls: TrackingUrls;
    ui: UI;
    user: User;
    userSiteinfo: UserSiteinfo;
    version: string;
}

export type Event
    = { type: 'ACTIVE_ENTRY_CAHNGED', index: number }
    | { type: 'ALL_ENTRIES_MARKED_AS_READ' }
    | { type: 'ALL_ENTRIES_MARKING_AS_READ' }
    | { type: 'ALL_ENTRIES_MARKING_AS_READ_FAILED' }
    | { type: 'APPLICATION_INITIALIZED' }
    | { type: 'BACKEND_AUTHENTICATED', authenticatedAt: number, exportUrl: string, token: any }
    | { type: 'BACKEND_AUTHENTICATING' }
    | { type: 'BACKEND_AUTHENTICATING_FAILED' }
    | { type: 'BOOKMARK_COUNTS_FETCHED', bookmarkCounts: { [url: string]: number } }
    | { type: 'CATEGORY_CREATED', category: Category }
    | { type: 'CATEGORY_CREATING' }
    | { type: 'CATEGORY_CREATING_FAILED' }
    | { type: 'CATEGORY_DELETED', categoryId: string | number, label: string }
    | { type: 'CATEGORY_DELETING', categoryId: string | number, label: string }
    | { type: 'CATEGORY_DELETING_FAILED', categoryId: string | number, label: string }
    | { type: 'CATEGORY_MARKED_AS_READ', categoryId: string | number, streamId: string, label: string }
    | { type: 'CATEGORY_MARKING_AS_READ', categoryId: string | number, streamId: string, label: string }
    | { type: 'CATEGORY_MARKING_AS_READ_FAILED', categoryId: string | number, streamId: string, label: string }
    | { type: 'CATEGORY_UPDATED', prevCategoryLabel: string, category: Category }
    | { type: 'CATEGORY_UPDATING', categoryId: string | number }
    | { type: 'CATEGORY_UPDATING_FAILED', categoryId: string | number }
    | { type: 'CUSTOM_STYLE_CHANGED', customStyles: string }
    | { type: 'DEFAULT_STREAM_OPTIONS_CHANGED', fetchOptions: StreamFetchOptions }
    | { type: 'ENTRIES_MARKED_AS_READ', entryIds: (string | number)[], readCounts: { [streamId: string]: number } }
    | { type: 'ENTRIES_MARKING_AS_READ', entryIds: (string | number)[] }
    | { type: 'ENTRIES_MARKING_AS_READ_FAILED', entryIds: (string | number)[] }
    | { type: 'ENTRY_COMMENTS_FETCHED', entryId: string | number, comments: Comment[] }
    | { type: 'ENTRY_COMMENTS_FETCHING', entryId: string | number }
    | { type: 'ENTRY_COMMENTS_FETCHING_FAILED', entryId: string | number }
    | { type: 'ENTRY_COMMENTS_HIDDEN', entryId: string | number }
    | { type: 'ENTRY_COMMENTS_SHOWN', entryId: string | number }
    | { type: 'ENTRY_PINNED', entryId: string | number, isPinned: boolean }
    | { type: 'ENTRY_PINNING', entryId: string | number }
    | { type: 'ENTRY_PINNING_FAILED', entryId: string | number }
    | { type: 'ENTRY_URLS_EXPANDED', urls: { [url: string]: string } }
    | { type: 'EXPANDED_ENTRY_CHANGED', index: number }
    | { type: 'FEED_MARKED_AS_READ', feedId: string | number, streamId: string }
    | { type: 'FEED_MARKING_AS_READ', feedId: string | number, streamId: string }
    | { type: 'FEED_MARKING_AS_READ_FAILED', feedId: string | number, streamId: string }
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
    | { type: 'FULL_CONTENT_WAS_NOT_FOUND', entryId: string | number }
    | { type: 'HELP_CLOSED' }
    | { type: 'HELP_OPENED' }
    | { type: 'INSTANT_NOTIFICATION_DISMISSED' }
    | { type: 'INSTANT_NOTIFICATION_SENT', instantNotification: InstantNotification }
    | { type: 'KEY_MAPPINGS_RESET' }
    | { type: 'KEY_MAPPING_DELETED', keys: string[] }
    | { type: 'KEY_MAPPING_UPDATED', keys: string[], mapping: KeyMapping }
    | { type: 'MORE_ENTRIES_FETCHED', streamId: string, continuation: string | null, entries: Entry[] }
    | { type: 'MORE_ENTRIES_FETCHING', streamId: string }
    | { type: 'MORE_ENTRIES_FETCHING_FAILED', streamId: string }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'READ_ENTRY_RESET' }
    | { type: 'SIDEBAR_CLOSED' }
    | { type: 'SIDEBAR_OPENED' }
    | { type: 'SITEINFO_UPDATED', items: SiteinfoItem[], updatedAt: number }
    | { type: 'SITEINFO_UPDATING' }
    | { type: 'SITEINFO_UPDATING_FAILED' }
    | { type: 'STREAM_CACHES_CLEARED' }
    | { type: 'STREAM_CACHE_CAPACITY_CHANGED', capacity: number }
    | { type: 'STREAM_CACHE_LIFETIME_CHANGED', lifetime: number }
    | { type: 'STREAM_FETCHED', stream: Stream  }
    | { type: 'STREAM_FETCHING', streamId: string, fetchOptions: StreamFetchOptions, fetchedAt: number }
    | { type: 'STREAM_FETCHING_FAILED', streamId: string, fetchOptions: StreamFetchOptions, fetchedAt: number }
    | { type: 'STREAM_HEIGHT_CACHE_UPDATED', streamId: string, heights: { [id: string]: number } }
    | { type: 'STREAM_HISTORY_OPTIONS_CHANGED', numStreamHistories: number }
    | { type: 'STREAM_SELECTED', streamId: string  }
    | { type: 'STREAM_UNSELECTED'  }
    | { type: 'STREAM_VIEW_CHANGED', streamView: StreamViewKind }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], fetchedAt: number }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'SUBSCRIPTIONS_FETCHING_FAILED' }
    | { type: 'SUBSCRIPTIONS_IMPORTING' }
    | { type: 'SUBSCRIPTIONS_IMPORTING_DONE' }
    | { type: 'SUBSCRIPTIONS_ORDER_CHANGED', order: SubscriptionOrderKind }
    | { type: 'SUBSCRIPTIONS_UNREAD_VIEWING_CHANGED', onlyUnread: boolean }
    | { type: 'THEME_CHANGED', theme: ThemeKind }
    | { type: 'TOKEN_REVOKED' }
    | { type: 'TOKEN_REVOKING' }
    | { type: 'TRACKING_URL_CACHE_CAPACITY_CHANGED', capacity: number }
    | { type: 'TRACKING_URL_EXPANDED', originalUrl: string, expandedUrl: string }
    | { type: 'TRACKING_URL_PATTERNS_RESET' }
    | { type: 'TRACKING_URL_PATTERN_ADDED', pattern: string }
    | { type: 'TRACKING_URL_PATTERN_DELETED', pattern: string }
    | { type: 'UNREAD_KEEPING_CHANGED', keepUnread: boolean }
    | { type: 'USER_FETCHED', profile: Profile }
    | { type: 'USER_FETCHING' }
    | { type: 'USER_FETCHING_FAILED' }
    | { type: 'USER_SITEINFO_ITEM_ADDED', item: SiteinfoItem }
    | { type: 'USER_SITEINFO_ITEM_DELETED', id: string | number }
    | { type: 'USER_SITEINFO_ITEM_UPDATED', item: SiteinfoItem };

export type Thunk<TResult = void> = (store: Store, context: ThunkContext) => TResult;

export type AsyncThunk<TResult = void> = Thunk<Promise<TResult>>;

export interface ThunkContext {
    environment: Environment;
    router: History;
    selectors: Selectors;
}

export interface Selectors {
    sortedCategoriesSelector: (state: State) => Category[];
    allSubscriptionsSelector: (state: State) => Subscription[];
    visibleSubscriptionsSelector: (state: State) => Subscription[];
    groupedSubscriptionsSelector: (state: State) => { [key: string]: GroupedSubscription };
    totalUnreadCountSelector: (state: State) => number;
}

export interface Environment {
    clientId: string;
    clientSecret: string;
    scope: string;
    redirectUri: string;
}

export interface Command<T extends object> {
    name: string;
    description: string;
    defaultParams: T;
    action(params: T): (Thunk<any> | Event);
}

export interface Backend {
    authenticatedAt: number;
    exportUrl: string;
    isLoading: boolean;
    token: object | null;
    version: number;
}

export interface Profile {
    picture: string;
    source: string;
    userName: string;
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
    lastUpdatedAt: number;
}

export interface Category {
    categoryId: string | number;
    streamId: string;
    label: string;
    isLoading: boolean;
}

export interface Streams {
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
    fetchOptions: StreamFetchOptions;
    heightCache: { [id: string]: number };
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
    isNotFound: boolean;
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
    isShown: boolean;
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

export interface TrackingUrls {
    items: CacheMap<string>;
    patterns: string[];
    version: number;
}

export interface Subscriptions {
    isImporting: boolean;
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
    readCount: number;
    updatedAt: number;
    isLoading: boolean;
}

export type SubscriptionOrderKind = 'id' | 'title' | 'newest' | 'oldest';

export interface GroupedSubscription {
    items: Subscription[];
    label: string | symbol;
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
    customStyles: string;
    expandedEntryIndex: number;
    helpIsOpened: boolean;
    isBooting: boolean;
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
    items: Trie<KeyMapping>;
    version: number;
}

export interface KeyMapping {
    commandId: string;
    params: object;
    preventNotification?: boolean;
}
