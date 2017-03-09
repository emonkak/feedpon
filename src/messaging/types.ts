export type Event
    = { type: 'CATEGORIES_FETCHED', categories: Category[] }
    | { type: 'VIEW_TYPE_CHANGED', viewMode: ViewType }
    | { type: 'FEED_FETCHED', feed: Feed }
    | { type: 'FEED_FETCHING', feedId: string }
    | { type: 'FEED_UNSELECTED' }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[] };

export interface AsyncEvent {
    (dispatch: (event: Event) => void, getState: () => State): void;
}

export interface State {
    categories: Category[];
    feed: Feed | null;
    notifications: Notification[];
    subscriptions: Subscription[];
    viewMode: ViewType;
}

export type ViewType = 'expanded' | 'collapsible';

export interface Feed {
    feedId: string;
    title: string;
    entries: Entry[];
    hasMoreEntries: boolean;
    isLoading: boolean;
}

export interface Entry {
    entryId: string | number;
    author: string;
    content: string;
    description: string;
    popularity: number;
    publishedAt: string;
    title: string;
    url: string;
}

export interface Subscription {
    feedId: string,
    subscriptionId: string | number;
    title: string;
    categoryId: number;
    unreadCount: number;
};

export interface Category {
    categoryId: number;
    feedId: string,
    name: string;
}

export interface Notification {
    id?: string | number;
    dismissAfter?: number;
    message: string;
    kind: 'default' | 'positive' | 'negative';
}
