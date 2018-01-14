import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/distinct';
import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/orderBy';
import '@emonkak/enumerable/extensions/selectMany';
import '@emonkak/enumerable/extensions/toArray';

import * as feedlyApi from 'adapters/feedly/api';
import { AsyncThunk, Event, Feed, Subscription, SubscriptionOrderKind } from 'messaging/types';
import { getFeedlyToken } from 'messaging/backend/actions';

export function fetchSubscriptions(): AsyncThunk {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'SUBSCRIPTIONS_FETCHING'
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const [feedlySubscriptions, feedlyUnreadCounts] = await Promise.all([
                feedlyApi.getSubscriptions(token.access_token),
                feedlyApi.getUnreadCounts(token.access_token)
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
                    readCount: 0,
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

export function addToCategory(subscription: Subscription, labelToAdd: string): AsyncThunk {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'FEED_SUBSCRIBING',
            feedId: subscription.feedId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const labels = Array.from(new Set([...subscription.labels, labelToAdd]));
            const categories = labels.map((label) => ({
                id: `user/${token.id}/category/${label}`,
                label
            }));

            await feedlyApi.subscribeFeed(token.access_token, {
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

export function removeFromCategory(subscription: Subscription, labelToRemove: string): AsyncThunk {
    return async ({ dispatch, getState }) => {
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

            await feedlyApi.subscribeFeed(token.access_token, {
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

export function subscribe(feed: Feed, labels: string[]): AsyncThunk {
    return async ({ dispatch, getState }) => {
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

            await feedlyApi.subscribeFeed(token.access_token, {
                id: feed.feedId as string,
                categories
            });

            const unreadCounts = await feedlyApi.getUnreadCounts(token.access_token, {
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
                    readCount: 0,
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

export function unsubscribe(subscription: Subscription): AsyncThunk {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'FEED_UNSUBSCRIBING',
            feedId: subscription.feedId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedlyApi.unsubscribeFeed(token.access_token, subscription.feedId as string);

            dispatch({
                type: 'FEED_UNSUBSCRIBED',
                feedId: subscription.feedId
            });
        } catch (error) {
            dispatch({
                type: 'FEED_UNSUBSCRIBING_FAILED',
                feedId: subscription.feedId
            });

            throw error;
        }
    };
}

export function changeSubscriptionOrder(order: SubscriptionOrderKind): Event {
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

export function importOpml(xmlString: string): AsyncThunk {
    return async ({ dispatch }) => {
        await dispatch({
            type: 'SUBSCRIPTIONS_IMPORTING'
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedlyApi.importOpml(token.access_token, xmlString);

            await dispatch(fetchSubscriptions());
        } finally {
            await dispatch({
                type: 'SUBSCRIPTIONS_IMPORTING_DONE'
            });
        }
    };
}
