import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/concat';
import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/selectMany';
import '@emonkak/enumerable/extensions/toArray';

import { AsyncEvent, Subscription } from 'messaging/types';
import { allCategories, allSubscriptions, allUnreadCounts } from 'adapters/feedly/api';

export function fetchSubscriptions(): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'SUBSCRIPTIONS_FETCHING'
        });

        const { credential } = getState();

        if (credential) {
            const [feedlyCategories, feedlySubscriptions, feedlyUnreadCounts] = await Promise.all([
                allCategories(credential.token.access_token),
                allSubscriptions(credential.token.access_token),
                allUnreadCounts(credential.token.access_token)
            ]);

            const uncategorizedCategory = {
                id: 'user/' + credential.token.id + '/category/global.uncategorized',
                label: 'Uncategorized'
            };

            const subscriptions = new Enumerable(feedlySubscriptions)
                .join(
                    feedlyUnreadCounts.unreadcounts,
                    (subscription) => subscription.id,
                    (unreadCount) => unreadCount.id,
                    (subscription, unreadCount) => ({ subscription, unreadCount })
                )
                .select(({ subscription, unreadCount }) => {
                    const categories = subscription.categories.length > 0
                        ? subscription.categories
                        : [uncategorizedCategory];

                    return {
                        subscriptionId: subscription.id,
                        feedId: subscription.id,
                        streamId: subscription.id,
                        categoryIds: categories.map((category) => category.id),
                        title: subscription.title || '',
                        iconUrl: subscription.iconUrl || '',
                        unreadCount: unreadCount.count
                    };
                })
                .toArray();

            const groupedSubscriptions: { [key: string]: Subscription[] } =
                subscriptions.reduce((group: { [key: string]: Subscription[] }, subscription: Subscription) => {
                    for (const categoryId of subscription.categoryIds) {
                        if (group[categoryId]) {
                            group[categoryId].push(subscription);
                        } else {
                            group[categoryId] = [subscription];
                        }
                    }
                    return group;
                }, {});

            const categories = new Enumerable(feedlyCategories)
                .join(
                    feedlyUnreadCounts.unreadcounts,
                    (category) => category.id,
                    (unreadCount) => unreadCount.id,
                    (category, unreadCount) => ({ category, unreadCount })
                )
                .select(({ category, unreadCount }) => ({
                    categoryId: category.id,
                    streamId: category.id,
                    label: category.label,
                    unreadCount: unreadCount.count,
                    subscriptions: groupedSubscriptions[category.id] || []
                }))
                .toArray();

            const totalUnreadCount = categories.reduce((total, category) =>
                total + category.unreadCount
            , 0);

            dispatch({
                type: 'SUBSCRIPTIONS_FETCHED',
                fetchedAt: new Date().toISOString(),
                categories,
                subscriptions,
                totalUnreadCount
            });
        }
    };
}
