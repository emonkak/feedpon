export type Event
    = { type: 'CATEGORIES_FETCHED', categories: Category[] }
    | { type: 'ENTRY_KEPT_AS_UNREAD', entryId: string }
    | { type: 'ENTRY_MARKED_AS_READ', entryId: string, readAt: string }
    | { type: 'FEED_FETCHED', feed: Feed }
    | { type: 'FEED_FETCHING', feedId: string }
    | { type: 'FEED_UNSELECTED' }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'READ_ENTRIES_CLEARED' }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[] }
    | { type: 'VIEW_MODE_CHANGED', viewMode: ViewMode };

export interface AsyncEvent {
    (dispatch: (event: Event) => void, getState: () => State): void;
}

export interface State {
    categories: Category[];
    feed: Feed | null;
    notifications: Notification[];
    preference: Preference;
    subscriptions: Subscription[];
}

export interface Category {
    categoryId: number;
    feedId: string,
    name: string;
}

export interface Feed {
    entries: Entry[];
    feedId: string;
    hasMoreEntries: boolean;
    isLoading: boolean;
    title: string;
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
    keepUnread: boolean;
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

export interface Subscription {
    feedId: string,
    subscriptionId: string | number;
    title: string;
    categoryId: number;
    unreadCount: number;
};
