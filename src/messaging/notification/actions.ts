import { AsyncEvent, Notification, SyncEvent } from '../types';

export const DEFAULT_DISMISS_AFTER = 3000;

export function sendNotification(notification: Notification): AsyncEvent<void> {
    if (!notification.id) {
        notification.id = Date.now();
    }

    return (dispatch) => {
        dispatch({
            type: 'NOTIFICATION_SENT',
            notification
        });

        if (notification.dismissAfter) {
            setTimeout(() => {
                dispatch(dismissNotification(notification.id));
            }, notification.dismissAfter);
        }
    };
}

export function dismissNotification(id: any): SyncEvent {
    return {
        type: 'NOTIFICATION_DISMISSED',
        id
    };
}
