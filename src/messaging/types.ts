export type Event
    = { type: 'APPLICATION_INITIALIZED' }
    | { type: 'AUTHENTICATED', authorizedAt: number, token: any }
    | { type: 'BOOKMARK_COUNTS_FETCHED', bookmarkCounts: { [key: string]: number } }
    | { type: 'CATEGORY_CREATED', category: Category }
    | { type: 'CATEGORY_CREATING' }
    | { type: 'CATEGORY_CREATING_FAILED' }
    | { type: 'CATEGORY_DELETED', category: Category }
    | { type: 'CATEGORY_DELETING', category: Category }
    | { type: 'CATEGORY_DELETING_FAILED', category: Category }
    | { type: 'CATEGORY_UPDATED', prevCategory: Category, category: Category }
    | { type: 'CATEGORY_UPDATING', category: Category }
    | { type: 'CATEGORY_UPDATING_FAILED', category: Category }
    | { type: 'COMMENTS_FETCHED', entryId: string | number, comments: Comment[] }
    | { type: 'COMMENTS_FETCHING', entryId: string | number }
    | { type: 'COMMENTS_FETCHING_FAILED', entryId: string | number }
    | { type: 'ENTRY_MARKED_AS_READ', entryIds: (string | number)[] }
    | { type: 'ENTRY_PINNED', entryId: string | number, isPinned: boolean }
    | { type: 'ENTRY_PINNING', entryId: string | number }
    | { type: 'ENTRY_PINNING_FAILED', entryId: string | number }
    | { type: 'ENTRY_URLS_EXPANDED', urls: { [key: string]: string } }
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
    | { type: 'SITEINFO_UPDATED', items: SiteinfoItem[], updatedAt: number }
    | { type: 'SITEINFO_UPDATING' }
    | { type: 'SITEINFO_UPDATING_FAILED' }
    | { type: 'STREAM_FETCHED', stream: Stream  }
    | { type: 'STREAM_FETCHING', streamId: string }
    | { type: 'STREAM_FETCHING_FAILED', streamId: string }
    | { type: 'STREAM_SETTINGS_CHANGED', defaultEntryOrder: EntryOrder, defaultNumEntries: number, defaultStreamView: StreamView, onlyUnreadEntries: boolean }
    | { type: 'STREAM_VIEW_CHANGED', streamId: string, view: StreamView }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], fetchedAt: number }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'SUBSCRIPTIONS_FETCHING_FAILED' }
    | { type: 'SUBSCRIPTIONS_ORDER_CHANGED', order: SubscriptionOrder }
    | { type: 'SUBSCRIPTIONS_UNREAD_VIEWING_CHANGED', onlyUnread: boolean }
    | { type: 'TRACKING_URL_PATTERN_ADDED', pattern: string }
    | { type: 'TRACKING_URL_PATTERN_REMOVED', pattern: string }
    | { type: 'USER_SITEINFO_ITEM_ADDED', item: SiteinfoItem }
    | { type: 'USER_SITEINFO_ITEM_REMOVED', id: string | number }
    | { type: 'USER_SITEINFO_ITEM_UPDATED', item: SiteinfoItem };

export type AsyncEvent<TResult = void> = (store: Store, context: Context) => Promise<TResult>;

export interface Store {
    getState(): State;
    dispatch(event: Event): Event;
    dispatch<TResult>(event: AsyncEvent<TResult>): TResult;
}

export interface State {
    categories: Categories;
    credential: Credential;
    notifications: Notifications;
    search: Search;
    siteinfo: Siteinfo;
    streamSettings: StreamSettings;
    streams: Streams;
    subscriptions: Subscriptions;
    trackingUrlSettings: TrackingUrlSettings;
    version: string;
}

export interface Context {
    environment: Environment;
}

export interface Credential {
    authorizedAt: number;
    token: object | null;
    version: number;
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
    current: Stream;
    isLoaded: boolean;
    isLoading: boolean;
    version: number;
}

export interface Stream {
    streamId: string | null;
    title: string;
    entries: Entry[];
    continuation: string | null;
    feed: Feed | null;
    options: StreamOptions;
}

export interface StreamOptions {
    numEntries: number;
    order: EntryOrder;
    onlyUnread: boolean;
    view: StreamView;
}

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
    defaultEntryOrder: EntryOrder;
    defaultNumEntries: number;
    defaultStreamView: StreamView;
    onlyUnreadEntries: boolean;
    version: number;
}

export type EntryOrder = 'newest' | 'oldest';

export interface TrackingUrlSettings {
    patterns: string[];
    version: number;
}

export interface Subscriptions {
    isLoading: boolean;
    items: Subscription[];
    lastUpdatedAt: number;
    onlyUnread: boolean;
    order: SubscriptionOrder;
    totalUnreadCount: number;
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

export type SubscriptionOrder = 'title' | 'newest' | 'oldest';

export interface Siteinfo {
    items: SiteinfoItem[];
    userItems: SiteinfoItem[];
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
