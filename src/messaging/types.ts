import { ExchangeTokenResponse } from 'supports/feedly/types';

export type Event
    = { type: 'AUTHENTICATED', credential: Credential }
    | { type: 'CATEGORIES_FETCHED', categories: Category[] }
    | { type: 'ENTRY_READ', entryIds: string[], readAt: string }
    | { type: 'ENTRY_MARKED_AS_READ', entryIds: string[] }
    | { type: 'FEED_FETCHED', feed: Feed }
    | { type: 'FEED_FETCHING', feedId: string }
    | { type: 'FEED_UNSELECTED' }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'READ_ENTRIES_CLEARED' }
    | { type: 'SUBSCRIPTIONS_FETCHING' }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[], fetchedAt: string }
    | { type: 'VIEW_MODE_CHANGED', viewMode: ViewMode };

export interface AsyncEvent {
    (dispatch: (event: Event) => void, getState: () => State): void;
}

export interface State {
    categories: Category[];
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
    categoryId: number;
    feedId: string,
    title: string;
}

export interface Feed {
    entries: Entry[];
    feedId: string;
    title: string;
    description: string;
    subscribers: number;
    hasMoreEntries: boolean;
    isLoading: boolean;
    subscription?: Subscription;
}

export interface Entry {
    entryId: string;
    title: string;
    author: string;
    url: string;
    origin: Origin;
    content: string;
    description: string;
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
    kind: 'default' | 'positive' | 'negative';
}

export interface Preference {
    viewMode: ViewMode;
}

export type ViewMode = 'expanded' | 'collapsible';

export interface Subscriptions {
    items: Subscription[];
    isLoading: boolean;
    lastUpdatedAt: string | null;
}

export interface Subscription {
    feedId: string,
    subscriptionId: string | number;
    title: string;
    categoryId: number;
    unreadCount: number;
};
