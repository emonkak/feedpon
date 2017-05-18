import { Notifications, Event } from '../types';

export default function reducer(notifications: Notifications, event: Event): Notifications {
    switch (event.type) {
        case 'NOTIFICATION_SENT':
            return {
                items: [...notifications.items, event.notification],
                version: notifications.version
            };

        case 'NOTIFICATION_DISMISSED':
            return {
                items: notifications.items.filter((notification) => notification.id !== event.id),
                version: notifications.version
            };

        default:
            return notifications;
    }
}
