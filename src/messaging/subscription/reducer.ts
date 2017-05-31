import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/distinct';
import '@emonkak/enumerable/extensions/startWith';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/orderBy';

import createAscendingComparer from 'utils/createAscendingComparer';
import createDescendingComparer from 'utils/createDescendingComparer';
import { Event, Subscription, SubscriptionOrder, Subscriptions } from 'messaging/types';

export default function reducer(subscriptions: Subscriptions, event: Event): Subscriptions {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...subscriptions,
                categories: {
                    isCreating: false,
                    items: subscriptions.categories.items
                },
                isLoading: false
            };

        case 'CATEGORY_CREATING':
            return {
                ...subscriptions,
                categories: {
                    isCreating: true,
                    items: subscriptions.categories.items
                }
            };

        case 'CATEGORY_CREATING_FAILED':
            return {
                ...subscriptions,
                categories: {
                    isCreating: false,
                    items: subscriptions.categories.items
                }
            };

        case 'CATEGORY_CREATED':
            return {
                ...subscriptions,
                categories: {
                    isCreating: false,
                    items: new Enumerable(subscriptions.categories.items)
                        .startWith(event.category)
                        .distinct((category) => category.categoryId)
                        .orderBy((category) => category.label)
                        .toArray()
                }
            };

        case 'SUBSCRIPTIONS_FETCHING':
            return {
                ...subscriptions,
                isLoading: true
            };

        case 'SUBSCRIPTIONS_FETCHING_FAILED':
            return {
                ...subscriptions,
                isLoading: false
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                ...subscriptions,
                categories: {
                    isCreating: subscriptions.categories.isCreating,
                    items: event.categories
                },
                isLoading: false,
                items: event.subscriptions.slice().sort(createSubscriptionComparer(subscriptions.order)),
                lastUpdatedAt: event.fetchedAt,
                totalUnreadCount: event.subscriptions.reduce(
                    (total, subscription) => total + subscription.unreadCount,
                    0
                )
            };

        case 'SUBSCRIPTIONS_ORDER_CHANGED':
            return {
                ...subscriptions,
                items: subscriptions.items.slice().sort(createSubscriptionComparer(event.order)),
                order: event.order
            };

        case 'SUBSCRIPTIONS_UNREAD_VIEWING_CHANGED':
            return {
                ...subscriptions,
                onlyUnread: event.onlyUnread
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

function createSubscriptionComparer(order: SubscriptionOrder): (x: Subscription, y: Subscription) => number {
    switch (order) {
        case 'title':
            return createAscendingComparer<Subscription>('title');

        case 'newest':
            return createDescendingComparer<Subscription>('updatedAt');

        case 'oldest':
            return createAscendingComparer<Subscription>('updatedAt');
    }
}
