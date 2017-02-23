export type Event
    = { type: 'VIEW_MODE_CHANGED', viewMode: ViewMode }
    | { type: 'FEED_SELECTED', feed: Feed }
    | { type: 'FEED_UNSELECTED' }
    | { type: 'ENTRIES_FETCHED', feed: Feed, entries: Entry[] }
    | { type: 'NOTIFICATION_DISMISSED', id: number }
    | { type: 'NOTIFICATION_SENT', notification: Notification }
    | { type: 'SUBSCRIPTIONS_FETCHED', subscriptions: Subscription[] };

export type AsyncAction = (dispatch: (event: Event) => void) => void;

export interface State {
    entries: Entry[];
    feed: Feed | null;
    notifications: Notification[];
    subscriptions: Subscription[];
    viewMode: ViewMode;
}

export type ViewMode = 'full' | 'compact';

export interface Feed {
    id?: string | number;
    title: string;
    type: FeedType;
}

export type FeedType = 'all' | 'category' | 'pin' | 'subscription';

export interface Entry {
    entryId: string | number;
    author: string;
    content: string;
    description: string;
    publishedAt: string;
    title: string;
    url: string;
}

export interface Subscription {
    subscriptionId: string | number;
    title: string;
    category: {
        categoryId: number;
        name: string;
    };
    unreadCount: number;
};

export interface Notification {
    id?: string | number;
    dismissAfter?: number;
    message: string;
    kind: 'default' | 'positive' | 'negative';
}
