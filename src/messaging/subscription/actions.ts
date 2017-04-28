import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/concat';
import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/selectMany';
import '@emonkak/enumerable/extensions/toArray';

import { AsyncEvent } from 'messaging/types';
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

            const categories = new Enumerable(feedlyCategories)
                .concat([uncategorizedCategory])
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
                    unreadCount: unreadCount.count
                }))
                .toArray();

            const subscriptions = new Enumerable(feedlySubscriptions)
                .join(
                    feedlyUnreadCounts.unreadcounts,
                    (subscription) => subscription.id,
                    (unreadCount) => unreadCount.id,
                    (subscription, unreadCount) => ({ subscription, unreadCount })
                )
                .selectMany(({ subscription, unreadCount }) => {
                    const categories = subscription.categories.length > 0
                        ? subscription.categories
                        : [uncategorizedCategory];

                    return categories.map((category) => ({
                        subscriptionId: subscription.id,
                        categoryId: category.id,
                        streamId: subscription.id,
                        title: subscription.title || '',
                        iconUrl: subscription.iconUrl || '',
                        unreadCount: unreadCount.count
                    }))
                })
                .toArray();

            const totalUnreadCount = categories.reduce(
                (total, category) => total + category.unreadCount,
                0
            );

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
