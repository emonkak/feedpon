import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/distinct';
import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/orderBy';
import '@emonkak/enumerable/extensions/selectMany';
import '@emonkak/enumerable/extensions/toArray';

import * as feedly from 'adapters/feedly/api';
import { AsyncEvent, Event, Feed, Subscription, SubscriptionOrder } from 'messaging/types';
import { getFeedlyToken } from 'messaging/credential/actions';

export function fetchSubscriptions(): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'SUBSCRIPTIONS_FETCHING'
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const [feedlySubscriptions, feedlyUnreadCounts] = await Promise.all([
                feedly.getSubscriptions(token.access_token),
                feedly.getUnreadCounts(token.access_token)
            ]);

            const subscriptions = new Enumerable(feedlySubscriptions)
                .join(
                    feedlyUnreadCounts.unreadcounts,
                    (subscription) => subscription.id,
                    (unreadCount) => unreadCount.id,
                    (subscription, unreadCount) => ({ subscription, unreadCount })
                )
                .select(({ subscription, unreadCount }) => ({
                    subscriptionId: subscription.id,
                    streamId: subscription.id,
                    feedId: subscription.id,
                    labels: subscription.categories.map((category) => category.label),
                    title: subscription.title || '',
                    url: subscription.website || '',
                    feedUrl: subscription.id.replace(/feed\//, ''),
                    iconUrl: subscription.iconUrl || '',
                    unreadCount: unreadCount.count,
                    updatedAt: unreadCount.updated,
                    isLoading: false
                }))
                .toArray();

            const categories = new Enumerable(feedlySubscriptions)
                .selectMany((subscription) => {
                    return subscription.categories;
                })
                .distinct((category) => category.id)
                .orderBy((category) => category.label)
                .select((category) => ({
                    categoryId: category.id,
                    streamId: category.id,
                    label: category.label,
                    isLoading: false
                }))
                .toArray();

            dispatch({
                type: 'SUBSCRIPTIONS_FETCHED',
                fetchedAt: Date.now(),
                categories,
                subscriptions
            });
        } catch (error) {
            dispatch({
                type: 'SUBSCRIPTIONS_FETCHING_FAILED'
            });

            throw error;
        }
    };
}

export function addToCategory(subscription: Subscription, labelToAdd: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_SUBSCRIBING',
            feedId: subscription.feedId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const labels = subscription.labels
                .filter((label) => label !== labelToAdd)
                .concat([labelToAdd]);
            const categories = labels.map((label) => ({
                id: `user/${token.id}/category/${label}`,
                label
            }));

            await feedly.subscribeFeed(token.access_token, {
                id: subscription.feedId as string,
                categories
            });

            dispatch({
                type: 'FEED_SUBSCRIBED',
                subscription: {
                    ...subscription,
                    labels
                }
            });
        } catch (error) {
            dispatch({
                type: 'FEED_SUBSCRIBING_FAILED',
                feedId: subscription.feedId
            });

            throw error;
        }
    };
}

export function removeFromCategory(subscription: Subscription, labelToRemove: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_SUBSCRIBING',
            feedId: subscription.feedId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const labels = subscription.labels.filter((label) => label !== labelToRemove);
            const categories = labels.map((label) => ({
                id: `user/${token.id}/category/${label}`,
                label
            }));

            await feedly.subscribeFeed(token.access_token, {
                id: subscription.feedId as string,
                categories
            });

            dispatch({
                type: 'FEED_SUBSCRIBED',
                subscription: {
                    ...subscription,
                    labels
                }
            });
        } catch (error) {
            dispatch({
                type: 'FEED_SUBSCRIBING_FAILED',
                feedId: subscription.feedId
            });

            throw error;
        }
    };
}

export function subscribe(feed: Feed, labels: string[]): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_SUBSCRIBING',
            feedId: feed.feedId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const categories = labels.map((label) => ({
                id: `user/${token.id}/category/${label}`,
                label
            }));

            await feedly.subscribeFeed(token.access_token, {
                id: feed.feedId as string,
                categories
            });

            const unreadCounts = await feedly.getUnreadCounts(token.access_token, {
                streamId: feed.streamId
            });
            const unreadCount = unreadCounts.unreadcounts
                .find((unreadCount) => unreadCount.id === feed.streamId);

            dispatch({
                type: 'FEED_SUBSCRIBED',
                subscription: {
                    subscriptionId: feed.feedId,
                    streamId: feed.streamId,
                    feedId: feed.feedId,
                    labels: categories.map((category) => category.label),
                    title: feed.title,
                    url: feed.url,
                    feedUrl: feed.feedUrl,
                    iconUrl: feed.iconUrl,
                    unreadCount: unreadCount ? unreadCount.count : 0,
                    updatedAt: unreadCount ? unreadCount.updated : 0,
                    isLoading: false
                }
            });
        } catch (error) {
            dispatch({
                type: 'FEED_SUBSCRIBING_FAILED',
                feedId: feed.feedId
            });

            throw error;
        }
    };
}

export function unsubscribe(subscription: Subscription): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_UNSUBSCRIBING',
            subscription
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedly.unsubscribeFeed(token.access_token, subscription.feedId as string);

            dispatch({
                type: 'FEED_UNSUBSCRIBED',
                subscription
            });
        } catch (error) {
            dispatch({
                type: 'FEED_UNSUBSCRIBING_FAILED',
                subscription
            });

            throw error;
        }
    };
}

export function changeSubscriptionOrder(order: SubscriptionOrder): Event {
    return {
        type: 'SUBSCRIPTIONS_ORDER_CHANGED',
        order
    };
}

export function changeUnreadViewing(onlyUnread: boolean): Event {
    return {
        type: 'SUBSCRIPTIONS_UNREAD_VIEWING_CHANGED',
        onlyUnread
    };
}
