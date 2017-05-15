import { AsyncEvent, NotificationKind, Event } from '../types';

const DEFAULT_DISMISS_AFTER = 3000;

export function sendNotification(message: string, kind: NotificationKind, dismissAfter: number = DEFAULT_DISMISS_AFTER): AsyncEvent {
    return (dispatch) => {
        const notification = {
            id: Date.now(),
            message,
            kind,
            dismissAfter
        };

        dispatch({
            type: 'NOTIFICATION_SENT',
            notification
        });
    };
}

export function dismissNotification(id: number): Event {
    return {
        type: 'NOTIFICATION_DISMISSED',
        id
    };
}
