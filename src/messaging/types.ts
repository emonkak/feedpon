export type Action
    = { type: 'DISMISS_NOTIFICATION', id: number }
    | { type: 'FETCH_ENTRIES', feed: Feed, entries: Entry[] }
    | { type: 'FETCH_SUBSCRIPTIONS', subscriptions: Subscription[] }
    | { type: 'SELECT_FEED', feed: Feed }
    | { type: 'SEND_NOTIFICATION', notification: Notification }
    | { type: 'UNSELECT_FEED' };

export type AsyncAction = (dispatch: (action: Action) => void) => void;

export interface State {
    entries: Entry[];
    feed: Feed | null;
    notifications: Notification[];
    pageTitle: string;
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
