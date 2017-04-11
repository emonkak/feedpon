import { ExchangeTokenResponse } from 'supports/feedly/types';

export type Event = SyncEvent | AsyncEvent;

export type SyncEvent
    = { type: 'AUTHENTICATED', credential: Credential }
    | { type: 'BOOKMARK_COUNTS_FETCHED', bookmarkCounts: { [key: string]: number } }
    | { type: 'COMMENTS_FETCHED', entryId: string, comments: Comment[] }
    | { type: 'ENTRY_MARKED_AS_READ', entryIds: string[] }
    | { type: 'ENTRY_READ', entryIds: string[], readAt: string }
    | { type: 'FEED_FETCHED', feed: Feed }
    | { type: 'FEED_FETCHING', feedId: string }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'READ_ENTRIES_CLEARED' }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], fetchedAt: string }
    | { type: 'VIEW_MODE_CHANGED', viewMode: ViewMode };

export interface AsyncEvent {
    (dispatch: (event: SyncEvent) => void, getState: () => State): void;
}

export interface State {
    credential: Credential | null;
    environment: Environment;
    feed: Feed;
    notifications: Notification[];
    preference: Preference;
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
    subscription: Subscription | null;
}

export interface Entry {
    entryId: string;
    title: string;
    author: string;
    url: string;
    origin: Origin;
    content: string;
    summary: string;
    bookmarkCount: number;
    bookmarkUrl: string;
    comments: Comments;
    publishedAt: string;
    markAsRead: boolean;
    readAt: string | null;
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
    viewMode: ViewMode;
}

export type ViewMode = 'expanded' | 'collapsible';

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
