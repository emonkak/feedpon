import { Subscriptions, SyncEvent } from 'messaging/types';

export default function reducer(subscriptions: Subscriptions, event: SyncEvent): Subscriptions {
    switch (event.type) {
        case 'SUBSCRIPTIONS_FETCHING':
            return {
                ...subscriptions,
                isLoading: true
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                categories: event.categories,
                isLoading: false,
                items: event.subscriptions,
                totalUnreadCount: event.totalUnreadCount,
                lastUpdatedAt: event.fetchedAt
            };

        default:
            return subscriptions;
    }
}
