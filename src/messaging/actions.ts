import { Action, AsyncAction, Notification, Subscription } from 'messaging/types';

export function fetchSubscriptions(): AsyncAction {
    const subscriptions: Subscription[] = [
        {
            subscriptionId: 1,
            title: 'Entry',
            category: {
                categoryId: 1,
                name: 'Bike',
            },
            unreadCount: 123,
        },
        {
            subscriptionId: 2,
            title: 'Really Very Long Title Entry',
            category: {
                categoryId: 1,
                name: 'Bike',
            },
            unreadCount: 0,
        },
        {
            subscriptionId: 3,
            title: 'Entry',
            category: {
                categoryId: 1,
                name: 'Bike',
            },
            unreadCount: 1234,
        },
        {
            subscriptionId: 4,
            title: 'Entry',
            category: {
                categoryId: 2,
                name: 'Programing',
            },
            unreadCount: 123,
        }
    ];

    return dispatch => {
        setTimeout(() => {
            dispatch({
                type: 'FETCH_SUBSCRIPTIONS',
                subscriptions,
            });
        }, 500);
    };
}

export function sendNotification(notification: Notification): AsyncAction {
    if (!notification.id) {
        notification.id = Date.now();
    }

    return dispatch => {
        dispatch({
            type: 'SEND_NOTIFICATION',
            notification
        });

        if (notification.dismissAfter) {
            setTimeout(() => {
                dispatch(dismissNotification(notification.id));
            }, notification.dismissAfter);
        }
    };
}

export function dismissNotification(id: number): Action {
    return {
        type: 'DISMISS_NOTIFICATION',
        id,
    };
}
