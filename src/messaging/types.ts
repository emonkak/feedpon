export type Event
    = { type: 'AUTHENTICATED', authorizedAt: string, token: any }
    | { type: 'BOOKMARK_COUNTS_FETCHED', bookmarkCounts: { [key: string]: number } }
    | { type: 'CATEGORY_CREATED', category: Category }
    | { type: 'CATEGORY_CREATING' }
    | { type: 'CATEGORY_CREATING_FAILED' }
    | { type: 'COMMENTS_FETCHED', entryId: string | number, comments: Comment[] }
    | { type: 'COMMENTS_FETCHING', entryId: string | number }
    | { type: 'COMMENTS_FETCHING_FAILED', entryId: string | number }
    | { type: 'ENTRY_MARKED_AS_READ', entryIds: (string | number)[] }
    | { type: 'ENTRY_PINNED', entryId: string | number, isPinned: boolean }
    | { type: 'ENTRY_PINNING', entryId: string | number }
    | { type: 'ENTRY_PINNING_FAILED', entryId: string | number }
    | { type: 'FEED_SEARCHED', query: string, feeds: Feed[] }
    | { type: 'FEED_SEARCHING', query: string }
    | { type: 'FEED_SEARCHING_FAILED', query: string }
    | { type: 'FEED_SUBSCRIBED', feedId: string | number, subscription: Subscription }
    | { type: 'FEED_SUBSCRIBING', feedId: string | number }
    | { type: 'FEED_SUBSCRIBING_FAILED', feedId: string | number }
    | { type: 'FEED_UNSUBSCRIBED', feedId: string | number }
    | { type: 'FULL_CONTENT_FETCHED', entryId: string | number, fullContent: FullContent }
    | { type: 'FULL_CONTENT_FETCHING', entryId: string | number }
    | { type: 'FULL_CONTENT_FETCHING_FAILED', entryId: string | number }
    | { type: 'MORE_ENTRIES_FETCHED', streamId: string, continuation: string | null, entries: Entry[] }
    | { type: 'MORE_ENTRIES_FETCHING', streamId: string }
    | { type: 'MORE_ENTRIES_FETCHING_FAILED', streamId: string }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'SITEINFO_UPDATED', items: SiteinfoItem[], updatedAt: string }
    | { type: 'SITEINFO_UPDATING' }
    | { type: 'SITEINFO_UPDATING_FAILED' }
    | { type: 'STREAM_FETCHED', stream: Stream  }
    | { type: 'STREAM_FETCHING', streamId: string }
    | { type: 'STREAM_FETCHING_FAILED', streamId: string }
    | { type: 'STREAM_VIEW_CHANGED', streamId: string, view: StreamView }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], fetchedAt: string }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'SUBSCRIPTIONS_FETCHING_FAILED' }
    | { type: 'USER_SITEINFO_ITEM_ADDED', item: SiteinfoItem }
    | { type: 'USER_SITEINFO_ITEM_REMOVED', id: string };

export type AsyncEvent<TResult = void> = (dispatch: Dispatcher, getState: () => State, context: Context) => Promise<TResult>;

export interface Dispatcher {
    (event: Event): Event;
    <TResult>(event: AsyncEvent<TResult>): TResult;
}

export interface State {
    credential: Credential;
    notifications: Notifications;
    search: Search;
    settings: Settings;
    siteinfo: Siteinfo;
    streams: Streams;
    subscriptions: Subscriptions;
}

export interface Context {
    environment: Environment;
}

export interface Credential {
    authorizedAt: string | null;
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
    isCreating: boolean;
    items: Category[];
}

export interface Category {
    categoryId: string;
    streamId: string;
    label: string;
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
    subscription: Subscription | null;
    options: StreamOptions;
}

export interface StreamOptions {
    numEntries: number;
    order: 'newest' | 'oldest';
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
    iconUrl: string;
    subscribers: number;
    isSubscribing: boolean;
}

export interface Entry {
    entryId: string | number;
    title: string;
    author: string;
    url: string;
    summary: string;
    content: string;
    publishedAt: string;
    bookmarkCount: number;
    bookmarkUrl: string;
    isPinned: boolean;
    isPinning: boolean;
    markedAsRead: boolean;
    origin: Origin | null;
    visual: Visual | null;
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
    nextPageUrl: string | null;
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

export interface Settings {
    defaultEntryOrder: 'newest' | 'oldest';
    defaultStreamView: StreamView;
    defaultNumEntries: number;
    defaultSubscriptionOrder: 'newest' | 'oldest';
    onlyUnreadEntries: boolean;
    onlyUnreadSubscriptions: boolean;
    version: number;
}

export interface Subscriptions {
    categories: Categories;
    isLoading: boolean;
    items: Subscription[];
    lastUpdatedAt: string | null;
    totalUnreadCount: number;
    version: number;
}

export interface Subscription {
    subscriptionId: string | number;
    feedId: string | number;
    streamId: string;
    labels: string[];
    title: string;
    url: string;
    iconUrl: string;
    unreadCount: number;
}

export interface Siteinfo {
    items: SiteinfoItem[];
    userItems: SiteinfoItem[];
    lastUpdatedAt: string | null;
    isLoading: boolean;
    version: number;
}

export interface SiteinfoItem {
    id: string | number;
    name: string;
    urlPattern: string;
    contentPath: string;
    nextLinkPath: string;
}
