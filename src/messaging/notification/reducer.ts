import { Notification, SyncEvent } from '../types';

export default function reducer(notifications: Notification[], event: SyncEvent): Notification[] {
    switch (event.type) {
        case 'NOTIFICATION_SENT':
            return [...notifications, event.notification];

        case 'NOTIFICATION_DISMISSED':
            return notifications.filter(notification => notification.id !== event.id)

        default:
            return notifications;
    }
}
