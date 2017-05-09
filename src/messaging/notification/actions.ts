import { AsyncEvent, NotificationKind, SyncEvent } from '../types';

const DEFAULT_DISMISS_AFTER = 3000;

export function sendNotification(message: string, kind: NotificationKind, dismissAfter: number = DEFAULT_DISMISS_AFTER): AsyncEvent<void> {
    const notification = {
        id: Date.now(),
        message,
        kind,
        dismissAfter,
    };

    return (dispatch) => {
        dispatch({
            type: 'NOTIFICATION_SENT',
            notification
        });
    };
}

export function dismissNotification(id: number): SyncEvent {
    return {
        type: 'NOTIFICATION_DISMISSED',
        id
    };
}
