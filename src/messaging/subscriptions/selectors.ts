import { createSelector } from 'reselect';
import shallowEqual from 'fbjs/lib/shallowEqual';

import composeComparers from 'utils/composeComparers';
import createAscendingComparer from 'utils/createAscendingComparer';
import createDescendingComparer from 'utils/createDescendingComparer';
import { GroupedSubscription, State, Subscription, SubscriptionOrderKind } from 'messaging/types';
import { UNCATEGORIZED } from 'messaging/categories/constants';

const labelsComparer = (x: Subscription, y: Subscription) => {
    if (x.labels.length === 0) {
        return y.labels.length > 0 ? 1 : 0;
    }
    if (y.labels.length === 0) {
        return x.labels.length > 0 ? -1 : 0;
    }
    if (shallowEqual(x.labels, y.labels)) {
        return 0;
    }
    return x.labels < y.labels ? -1 : 1;
};

export const subscriptionIdComparer = composeComparers(
    labelsComparer,
    createAscendingComparer<Subscription>('subscriptionId')
);
export const subscriptionTitleComparer = composeComparers(
    labelsComparer,
    createAscendingComparer<Subscription>('title')
);
export const subscriptionNewestComparer = composeComparers(
    labelsComparer,
    createDescendingComparer<Subscription>('updatedAt')
);
export const subscriptionOldestComparer = composeComparers(
    labelsComparer,
    createAscendingComparer<Subscription>('updatedAt')
);

export function createAllSubscriptionsSelector() {
    return createSelector(
        (state: State) => state.subscriptions.items,
        getAllSubscriptions
    );
}

export function createVisibleSubscriptionsSelector(
    subscriptionsSelector: (state: State) => Subscription[]
) {
    return createSelector(
        (state: State) => state.subscriptions.items,
        (state: State) => state.subscriptions.order,
        (state: State) => state.subscriptions.onlyUnread,
        getVisibleSubscriptions
    );
}

export function createGroupedSubscriptionsSelector(
    subscriptionsSelector: (state: State) => Subscription[]
) {
    return createSelector(
        subscriptionsSelector,
        getGroupedSubscriptions
    );
}

export function createTotalUnreadCountSelector(
    subscriptionsSelector: (state: State) => Subscription[]
) {
    return createSelector(
        subscriptionsSelector,
        getTotalUnreadCount
    );
}

function getAllSubscriptions(subscriptions: { [streamId: string]: Subscription }): Subscription[] {
    return Object.values(subscriptions);
}

function getVisibleSubscriptions(subscriptions: { [streamId: string]: Subscription }, order: SubscriptionOrderKind, onlyUnread: boolean): Subscription[] {
    const comparer = getSubscriptionComparer(order);

    if (onlyUnread) {
        return Object.values(subscriptions)
            .filter((subscription) => subscription.unreadCount > 0)
            .sort(comparer);
    } else {
        return Object.values(subscriptions)
            .sort(comparer);
    }
}

function getGroupedSubscriptions(subscriptions: Subscription[]): { [key: string]: GroupedSubscription } {
    return subscriptions.reduce<{ [key: string]: GroupedSubscription }>((acc, subscription) => {
        const labels = subscription.labels.length > 0 ? subscription.labels : [UNCATEGORIZED];
        for (const label of labels) {
            if (acc[label]) {
                acc[label].items.push(subscription);
                if (subscription.unreadCount > subscription.readCount) {
                    acc[label].unreadCount += subscription.unreadCount - subscription.readCount;
                }
            } else {
                acc[label] = {
                    label,
                    items: [subscription],
                    unreadCount: subscription.unreadCount > subscription.readCount
                        ? subscription.unreadCount - subscription.readCount
                        : 0
                };
            }
        }
        return acc;
    }, {});
}

function getTotalUnreadCount(subscriptions: Subscription[]): number {
    const unreadCount = subscriptions.reduce<number>(
        (total, subscription) =>
            subscription.unreadCount > subscription.readCount ?
                total + subscription.unreadCount - subscription.readCount :
                total,
        0
    );
    return unreadCount > 0 ? unreadCount : 0;
}

function getSubscriptionComparer(order: SubscriptionOrderKind) {
    switch (order) {
        case 'id':
            return subscriptionIdComparer;

        case 'title':
            return subscriptionTitleComparer;

        case 'newest':
            return subscriptionNewestComparer;

        case 'oldest':
            return subscriptionOldestComparer;
    }
}
