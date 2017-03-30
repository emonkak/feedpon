import { ExchangeTokenResponse } from 'supports/feedly/types';

export type Event = SyncEvent | AsyncEvent;

export type SyncEvent
    = { type: 'AUTHENTICATED', credential: Credential }
    | { type: 'ENTRY_READ', entryIds: string[], readAt: string }
    | { type: 'ENTRY_MARKED_AS_READ', entryIds: string[] }
    | { type: 'FEED_FETCHED', feed: Feed }
    | { type: 'FEED_FETCHING', feedId: string }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'READ_ENTRIES_CLEARED' }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], categories: Category[], fetchedAt: string }
    | { type: 'VIEW_MODE_CHANGED', viewMode: ViewMode };

export interface AsyncEvent {
    (dispatch: (event: Event) => void, getState: () => State): void;
}

export interface State {
    credential: Credential | null;
    environment: Environment;
    feed: Feed | null;
    notifications: Notification[];
    preference: Preference;
    subscriptions: Subscriptions;
}

export interface Credential {
    authorizedAt: string;
    token: ExchangeTokenResponse;
}

export interface Environment {
    endpoint: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    redirectUri: string;
}

export interface Category {
    categoryId: string;
    feedId: string,
    title: string;
}

export interface Feed {
    feedId: string;
    title: string;
    description: string;
    entries: Entry[];
    subscribers: number;
    hasMoreEntries: boolean;
    isLoading: boolean;
    subscription?: Subscription;
}

export interface Entry {
    entryId: string;
    title: string;
    author?: string;
    url: string;
    origin: Origin;
    content?: string;
    summary?: string;
    bookmarks: number;
    publishedAt: string;
    markAsRead: boolean;
    readAt?: string;
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
    feedId: string,
    subscriptionId: string;
    title: string;
    categoryId: string;
    unreadCount: number;
};
