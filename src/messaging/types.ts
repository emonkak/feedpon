export type Action = FetchSubscriptions | SendNotification | DismissNotification;

export type AsyncAction = (dispatch: (action: Action) => void) => void;

export interface State {
    subscriptions: Subscription[];
    notifications: Notification[];
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

export interface FetchSubscriptions {
    type: 'FETCH_SUBSCRIPTIONS';
    subscriptions: Subscription[];
};

export interface SendNotification {
    type: 'SEND_NOTIFICATION';
    notification: Notification;
};

export interface DismissNotification {
    type: 'DISMISS_NOTIFICATION';
    id: number;
};
