import { ExchangeTokenResponse } from 'adapters/feedly/types';

export type Dispatcher = (event: Event) => void;

export type Event = SyncEvent | AsyncEvent<any>;

export type SyncEvent
    = { type: 'AUTHENTICATED', credential: Credential }
    | { type: 'BOOKMARK_COUNTS_FETCHED', bookmarkCounts: { [key: string]: number } }
    | { type: 'COMMENTS_FETCHED', entryId: string | number, comments: Comment[] }
    | { type: 'ENTRY_MARKED_AS_READ', entryIds: (string | number)[] }
    | { type: 'ENTRY_PINNED', entryId: string | number, isPinned: boolean }
    | { type: 'ENTRY_PINNING', entryId: string | number }
    | { type: 'FEED_SEARCHED', query: string, feeds: Feed[] }
    | { type: 'FEED_SEARCHING', query: string }
    | { type: 'FULL_CONTENT_FETCHED', entryId: string | number, fullContent: FullContent | null }
    | { type: 'FULL_CONTENT_FETCHING', entryId: string | number }
    | { type: 'MORE_ENTRIES_FETCHED', streamId: string, continuation: string | null, entries: Entry[] }
    | { type: 'MORE_ENTRIES_FETCHING', streamId: string }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'SITEINFO_UPDATED', items: SiteinfoItem[], updatedAt: string }
    | { type: 'SITEINFO_UPDATING' }
    | { type: 'STREAM_FETCHED', stream: Stream }
    | { type: 'STREAM_FETCHING', streamId: string }
    | { type: 'STREAM_VIEW_CHANGED', view: StreamView }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], totalUnreadCount: number, fetchedAt: string }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'USER_SITEINFO_ITEM_ADDED', item: SiteinfoItem }
    | { type: 'USER_SITEINFO_ITEM_REMOVED', id: string };

export interface AsyncEvent<T> {
    (dispatch: (event: SyncEvent) => void, getState: () => State): T;
}

export interface State {
    credential: Credential | null;
    search: Search;
    environment: Environment;
    notifications: Notification[];
    settings: Settings;
    siteinfo: Siteinfo;
    stream: Stream;
    subscriptions: Subscriptions;
}

export interface Credential {
    authorizedAt: string;
    token: ExchangeTokenResponse;
}


export interface Search {
    feeds: Feed[];
    isLoading: boolean;
    isLoaded: boolean;
    query: string;
}

export interface Environment {
    clientId: string;
    clientSecret: string;
    scope: string;
    redirectUri: string;
}

export interface Category {
    categoryId: string | number;
    streamId: string;
    label: string;
    unreadCount: number;
    subscriptions: Subscription[];
}

export interface Stream {
    streamId: string | null;
    title: string;
    entries: Entry[];
    continuation: string | null;
    unreadCount: number;
    isLoading: boolean;
    isLoaded: boolean;
    feed: Feed | null;
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
    subscribers: number;
    subscription: Subscription | null;
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
    items: Comment[];
}

export interface Comment {
    user: string;
    comment: string;
    timestamp: string;
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
}

export interface Subscriptions {
    categories: Category[];
    isLoading: boolean;
    items: Subscription[];
    totalUnreadCount: number;
    lastUpdatedAt: string | null;
}

export interface Subscription {
    subscriptionId: string | number;
    feedId: string | number;
    streamId: string;
    categoryIds: (string | number)[];
    title: string;
    iconUrl: string;
    unreadCount: number;
}

export interface Siteinfo {
    items: SiteinfoItem[];
    userItems: SiteinfoItem[];
    lastUpdatedAt: string;
    isLoading: boolean;
}

export interface SiteinfoItem {
    id: string | number;
    name: string;
    urlPattern: string;
    contentPath: string;
    nextLinkPath: string;
}
