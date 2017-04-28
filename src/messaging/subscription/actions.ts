import Enumerable from '@emonkak/enumerable';

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
            const [categoriesResponse, subscriptionsResponse, unreadCountsResponse] = await Promise.all([
                allCategories(credential.token.access_token),
                allSubscriptions(credential.token.access_token),
                allUnreadCounts(credential.token.access_token)
            ]);

            const categories = categoriesResponse.map(category => ({
                categoryId: category.id,
                streamId: category.id,
                label: category.label
            }));

            const subscriptions = new Enumerable(subscriptionsResponse)
                .join(
                    unreadCountsResponse.unreadcounts,
                    (subscription) => subscription.id,
                    (unreadCount) => unreadCount.id,
                    (subscription, unreadCount) => ({ subscription, unreadCount })
                )
                .selectMany(({ subscription, unreadCount }) =>
                    subscription.categories.map((category) => ({
                        subscriptionId: subscription.id,
                        categoryId: category.id,
                        streamId: subscription.id,
                        title: subscription.title || '',
                        iconUrl: subscription.iconUrl || '',
                        unreadCount: unreadCount.count
                    }))
                )
                .toArray();

            dispatch({
                type: 'SUBSCRIPTIONS_FETCHED',
                categories,
                fetchedAt: new Date().toISOString(),
                subscriptions
            });
        }
    };
}
