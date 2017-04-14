import { ExchangeTokenResponse } from 'supports/feedly/types';

export type Dispatcher = (event: Event) => void;

export type Event = SyncEvent | AsyncEvent<any>;

export type SyncEvent
    = { type: 'AUTHENTICATED', credential: Credential }
    | { type: 'BOOKMARK_COUNTS_FETCHED', bookmarkCounts: { [key: string]: number } }
    | { type: 'COMMENTS_FETCHED', entryId: string, comments: Comment[] }
    | { type: 'ENTRY_MARKED_AS_READ', entryIds: string[] }
    | { type: 'ENTRY_READ', entryIds: string[], readAt: string }
    | { type: 'FEED_FETCHED', feed: Feed }
    | { type: 'FEED_FETCHING', feedId: string }
    | { type: 'FEED_VIEW_CHANGED', view: FeedView }
    | { type: 'FULL_CONTENT_FETCHED', entryId: string, fullContent: FullContent | null, nextPageUrl: string | null }
    | { type: 'FULL_CONTENT_FETCHING', entryId: string }
    | { type: 'MORE_ENTRIES_FETCHING', feedId: string }
    | { type: 'MORE_ENTRIES_FETCHED', feedId: string, continuation: string | null, entries: Entry[] }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'READ_ENTRIES_CLEARED' }
    | { type: 'SITEINFO_UPDATED', siteinfo: Siteinfo }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], fetchedAt: string }
    | { type: 'SUBSCRIPTIONS_FETCHING' };

export interface AsyncEvent<T> {
    (dispatch: (event: SyncEvent) => void, getState: () => State): T;
}

export interface State {
    credential: Credential | null;
    environment: Environment;
    feed: Feed;
    notifications: Notification[];
    preference: Preference;
    subscriptions: Subscriptions;
    siteinfo: Siteinfo;
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
    feedId: string,
    label: string;
}

export interface Feed {
    feedId: string | null;
    title: string;
    description: string;
    url: string;
    entries: Entry[];
    subscribers: number;
    velocity: number;
    continuation: string | null;
    isLoading: boolean;
    isLoaded: boolean;
    subscription: Subscription | null;
    specification: FeedSpecification;
    view: FeedView;
}

export interface FeedSpecification {
    numEntries: number;
    order: 'newest' | 'oldest';
    onlyUnread: boolean;
}

export type FeedView = 'expanded' | 'collapsible';

export interface Entry {
    entryId: string;
    title: string;
    author: string;
    url: string;
    origin: Origin;
    summary: string;
    content: string;
    fullContents: FullContents;
    bookmarkCount: number;
    bookmarkUrl: string;
    comments: Comments;
    publishedAt: string;
    markAsRead: boolean;
    readAt: string | null;
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

export interface Origin {
    feedId: string;
    title: string;
    url: string;
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
    defaultFeedView: FeedView;
    defaultNumEntries: number;
    defaultSubscriptionsOrder: 'newest' | 'oldest';
    onlyUnreadEntries: boolean;
    onlyUnreadSubscriptions: boolean;
}

export interface Subscriptions {
    categories: Category[];
    isLoading: boolean;
    items: Subscription[];
    lastUpdatedAt: string | null;
}

export interface Subscription {
    subscriptionId: string;
    categoryId: string;
    feedId: string,
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
