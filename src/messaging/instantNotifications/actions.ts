import { Event } from '../types';

const DEFAULT_DISMISS_AFTER = 1000;

export function sendInstantNotification(message: string, dismissAfter: number = DEFAULT_DISMISS_AFTER): Event {
    return {
        type: 'INSTANT_NOTIFICATION_SENT',
        instantNotification: {
            message,
            dismissAfter
        }
    };
}

export function dismissInstantNotification(): Event {
    return {
        type: 'INSTANT_NOTIFICATION_DISMISSED'
    };
}
