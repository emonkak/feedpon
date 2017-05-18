import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/distinct';
import '@emonkak/enumerable/extensions/startWith';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/orderBy';

import { Subscriptions, Event } from 'messaging/types';

export default function reducer(subscriptions: Subscriptions, event: Event): Subscriptions {
    switch (event.type) {
        case 'CATEGORY_CREATED':
            return {
                ...subscriptions,
                categories: new Enumerable(subscriptions.categories)
                    .startWith(event.category)
                    .distinct((category) => category.categoryId)
                    .orderBy((category) => category.label)
                    .toArray()
            };

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
                ),
                version: subscriptions.version
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
