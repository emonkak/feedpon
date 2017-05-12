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
                lastUpdatedAt: event.fetchedAt,
                totalUnreadCount: event.subscriptions.reduce(
                    (total, subscription) => total + subscription.unreadCount,
                    0
                )
            };

        case 'FEED_SUBSCRIBED':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .filter((subscription) => subscription.feedId !== event.feedId)
                    .concat([event.subscription])
            };

        case 'FEED_UNSUBSCRIBED':
            return {
                ...subscriptions,
                items: subscriptions.items.filter(
                    (subscription) => subscription.feedId !== event.feedId
                )
            };

        default:
            return subscriptions;
    }
}
