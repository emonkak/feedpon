export type Event
    = { type: 'FEED_SELECTED', feed: Feed }
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
}

export interface Feed {
    id?: number;
    title: string;
    type: 'all' | 'category' | 'pin' | 'subscription';
}

export interface Entry {
    entryId: number;
    author: string;
    content: string;
    postedAt: string;
    title: string;
    url: string;
}

export interface Subscription {
    subscriptionId: number;
    title: string;
    category: {
        categoryId: number;
        name: string;
    };
    unreadCount: number;
};

export interface Notification {
    id?: number;
    dismissAfter?: number;
    message: string;
    kind: 'default' | 'positive' | 'negative';
}
