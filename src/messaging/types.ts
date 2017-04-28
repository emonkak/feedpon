import { ExchangeTokenResponse } from 'adapters/feedly/types';

export type Dispatcher = (event: Event) => void;

export type Event = SyncEvent | AsyncEvent<any>;

export type SyncEvent
    = { type: 'AUTHENTICATED', credential: Credential }
    | { type: 'BOOKMARK_COUNTS_FETCHED', bookmarkCounts: { [key: string]: number } }
    | { type: 'COMMENTS_FETCHED', entryId: string, comments: Comment[] }
    | { type: 'ENTRY_MARKED_AS_READ', entryIds: string[] }
    | { type: 'ENTRY_PINNED', entryId: string, isPinned: boolean }
    | { type: 'ENTRY_PINNING', entryId: string }
    | { type: 'FULL_CONTENT_FETCHED', entryId: string, fullContent: FullContent | null, nextPageUrl: string | null }
    | { type: 'FULL_CONTENT_FETCHING', entryId: string }
    | { type: 'MORE_ENTRIES_FETCHED', streamId: string, continuation: string | null, entries: Entry[] }
    | { type: 'MORE_ENTRIES_FETCHING', streamId: string }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'SITEINFO_UPDATED', siteinfo: Siteinfo }
    | { type: 'STREAM_FETCHED', stream: Stream }
    | { type: 'STREAM_FETCHING', streamId: string }
    | { type: 'STREAM_VIEW_CHANGED', view: StreamView }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], totalUnreadCount: number, fetchedAt: string }
    | { type: 'SUBSCRIPTIONS_FETCHING' };

export interface AsyncEvent<T> {
    (dispatch: (event: SyncEvent) => void, getState: () => State): T;
}

export interface State {
    credential: Credential | null;
    environment: Environment;
    notifications: Notification[];
    preference: Preference;
    siteinfo: Siteinfo;
    stream: Stream;
    subscriptions: Subscriptions;
}

export interface Credential {
    authorizedAt: string;
    token: ExchangeTokenResponse;
}

export interface Environment {
    clientId: string;
    clientSecret: string;
    scope: string;
    redirectUri: string;
}

export interface Category {
    categoryId: string;
    streamId: string,
    label: string;
    unreadCount: number;
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
    description: string;
    url: string;
    subscribers: number;
    velocity: number;
}

export interface Entry {
    entryId: string;
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
    nextPageUrl: string | null;
}

export interface FullContent {
    url: string;
    content: string;
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
    id?: string | number;
    dismissAfter?: number;
    message: string;
    kind: NotificationKind;
}

export type NotificationKind = 'default' | 'positive' | 'negative';

export interface Preference {
    defaultEntryOrder: 'newest' | 'oldest';
    defaultStreamView: StreamView;
    defaultNumEntries: number;
    defaultSubscriptionsOrder: 'newest' | 'oldest';
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
    subscriptionId: string;
    categoryId: string;
    streamId: string,
    title: string;
    iconUrl: string;
    unreadCount: number;
};

export interface Siteinfo {
    items: SiteinfoItem[];
    lastUpdatedAt: string;
}

export interface SiteinfoItem {
    url: string;
    contentPath: string;
    nextLinkPath: string;
}
