export type Event
    = { type: 'VIEW_TYPE_CHANGED', viewType: ViewType }
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
    viewType: ViewType;
}

export type ViewType = 'expanded' | 'collapsable';

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
    popularity: number;
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
