import type { Notifications, Event } from '../index';

export default function reducer(notifications: Notifications, event: Event): Notifications {
    switch (event.type) {
        case 'NOTIFICATION_SENT':
            return {
                ...notifications,
                items: [...notifications.items, event.notification]
            };

        case 'NOTIFICATION_DISMISSED':
            return {
                ...notifications,
                items: notifications.items.filter((notification) => notification.id !== event.id)
            };

        default:
            return notifications;
    }
}
