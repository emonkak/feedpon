import { Event, InstantNotifications } from 'messaging/types';

export default function reducer(instantNotifications: InstantNotifications, event: Event): InstantNotifications {
    switch (event.type) {
        case 'INSTANT_NOTIFICATION_SENT':
            return {
                ...instantNotifications,
                item: event.instantNotification
            };

        case 'INSTANT_NOTIFICATION_DISMISSED':
            return {
                ...instantNotifications,
                item: null
            };

        default:
            return instantNotifications;
    }
}
