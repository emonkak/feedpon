import { CacheMap } from 'utils/CacheMap';

export type Event
    = { type: 'APPLICATION_INITIALIZED' }
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
    | { type: 'CATEGORY_UPDATED', prevCategory: Category, category: Category }
    | { type: 'CATEGORY_UPDATING', category: Category }
    | { type: 'CATEGORY_UPDATING_FAILED', category: Category }
    | { type: 'COMMENTS_FETCHED', entryId: string | number, comments: Comment[] }
    | { type: 'COMMENTS_FETCHING', entryId: string | number }
    | { type: 'COMMENTS_FETCHING_FAILED', entryId: string | number }
    | { type: 'DEFAULT_STREAM_OPTIONS_CHANGED', fetchOptions: StreamFetchOptions }
    | { type: 'DEFAULT_STREAM_VIEW_CHANGED', streamView: StreamView }
    | { type: 'ENTRIES_MARKED_AS_READ', entryIds: (string | number)[], readCounts: { [streamId: string]: number } }
    | { type: 'ENTRIES_MARKING_AS_READ', entryIds: (string | number)[] }
    | { type: 'ENTRIES_MARKING_AS_READ_FAILED', entryIds: (string | number)[] }
    | { type: 'ENTRY_PINNED', entryId: string | number, isPinned: boolean }
    | { type: 'ENTRY_PINNING', entryId: string | number }
    | { type: 'ENTRY_PINNING_FAILED', entryId: string | number }
    | { type: 'ENTRY_URLS_EXPANDED', urls: { [url: string]: string } }
    | { type: 'FEED_MARKED_AS_READ', feedId: string | number }
    | { type: 'FEED_MARKING_AS_READ', feedId: string | number }
    | { type: 'FEED_MARKING_AS_READ_FAILED', feedId: string | number }
    | { type: 'FEED_SEARCHED', query: string, feeds: Feed[] }
    | { type: 'FEED_SEARCHING', query: string }
    | { type: 'FEED_SEARCHING_FAILED', query: string }
    | { type: 'FEED_SUBSCRIBED', subscription: Subscription }
    | { type: 'FEED_SUBSCRIBING', feedId: string | number }
    | { type: 'FEED_SUBSCRIBING_FAILED', feedId: string | number }
    | { type: 'FEED_UNSUBSCRIBED', subscription: Subscription }
    | { type: 'FEED_UNSUBSCRIBING', subscription: Subscription }
    | { type: 'FEED_UNSUBSCRIBING_FAILED', subscription: Subscription }
    | { type: 'FULL_CONTENT_FETCHED', entryId: string | number, fullContent: FullContent }
    | { type: 'FULL_CONTENT_FETCHING', entryId: string | number }
    | { type: 'FULL_CONTENT_FETCHING_FAILED', entryId: string | number }
    | { type: 'MORE_ENTRIES_FETCHED', streamId: string, continuation: string | null, entries: Entry[] }
    | { type: 'MORE_ENTRIES_FETCHING', streamId: string }
    | { type: 'MORE_ENTRIES_FETCHING_FAILED', streamId: string }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'SCROLL_ENDED' }
    | { type: 'SCROLL_STARTED' }
    | { type: 'SIDEBAR_CLOSED' }
    | { type: 'SIDEBAR_OPENED' }
    | { type: 'SITEINFO_UPDATED', items: SiteinfoItem[], updatedAt: number }
    | { type: 'SITEINFO_UPDATING' }
    | { type: 'SITEINFO_UPDATING_FAILED' }
    | { type: 'STREAM_CACHE_OPTIONS_CHANGED', capacity: number, lifetime: number }
    | { type: 'STREAM_FETCHED', stream: Stream  }
    | { type: 'STREAM_FETCHING', streamId: string, fetchOptions: StreamFetchOptions, fetchedAt: number }
    | { type: 'STREAM_FETCHING_FAILED', streamId: string, fetchOptions: StreamFetchOptions, fetchedAt: number }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], fetchedAt: number }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'SUBSCRIPTIONS_FETCHING_FAILED' }
    | { type: 'SUBSCRIPTIONS_ORDER_CHANGED', order: SubscriptionsOrder }
    | { type: 'SUBSCRIPTIONS_UNREAD_VIEWING_CHANGED', onlyUnread: boolean }
    | { type: 'THEME_CHANGED', theme: Theme }
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

export type AsyncEvent<TResult = void> = (store: Store, context: Context) => Promise<TResult>;

export interface Store {
    getState(): State;
    dispatch(event: Event): Event;
    dispatch<TResult>(event: AsyncEvent<TResult>): Promise<TResult>;
}

export interface State {
    categories: Categories;
    credential: Credential;
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

export interface Context {
    environment: Environment;
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

export interface Environment {
    clientId: string;
    clientSecret: string;
    scope: string;
    redirectUri: string;
}

export interface Categories {
    isLoading: boolean;
    items: Category[];
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
    defaultStreamView: StreamView;
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
    fetchOptions: StreamFetchOptions | null;
}

export interface StreamFetchOptions {
    entryOrder: EntryOrder;
    numEntries: number;
    onlyUnread: boolean;
}

export type EntryOrder = 'newest' | 'oldest';

export type StreamView = 'expanded' | 'collapsible';

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
    items: FullContent[];
    isLoaded: boolean;
    isLoading: boolean;
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

export interface StreamSettings {
    defaultFetchOptions: StreamFetchOptions;
    defaultStreamView: StreamView;
    version: number;
}

export interface TrackingUrlPatterns {
    items: string[];
    version: number;
}

export interface Subscriptions {
    isLoading: boolean;
    items: Subscription[];
    lastUpdatedAt: number;
    onlyUnread: boolean;
    order: SubscriptionsOrder;
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

export type SubscriptionsOrder = 'title' | 'newest' | 'oldest';

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
    isScrolling: boolean;
    sidebarIsOpened: boolean;
    theme: Theme;
    version: number;
}

export type Theme = 'theme-light' | 'theme-dark';
