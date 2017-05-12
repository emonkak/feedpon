import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/distinct';
import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/orderBy';
import '@emonkak/enumerable/extensions/selectMany';
import '@emonkak/enumerable/extensions/toArray';

import * as feedly from 'adapters/feedly/api';
import { getCredential } from 'messaging/credential/actions';
import { AsyncEvent, Category, Feed } from 'messaging/types';

export function fetchSubscriptions(): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'SUBSCRIPTIONS_FETCHING'
        });

        const credential = await getCredential()(dispatch, getState);

        const [feedlySubscriptions, feedlyUnreadCounts] = await Promise.all([
            feedly.getSubscriptions(credential.token.access_token),
            feedly.getUnreadCounts(credential.token.access_token)
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
                categoryIds: subscription.categories.map((category) => category.id),
                title: subscription.title || '',
                iconUrl: subscription.iconUrl || '',
                unreadCount: unreadCount.count
            }))
            .toArray();

        const categories = new Enumerable(feedlySubscriptions)
            .selectMany((subscription) => {
                return subscription.categories;
            })
            .distinct((category) => category.id)
            .orderBy((category) => category.id)
            .select((category) => ({
                categoryId: category.id,
                streamId: category.id,
                label: category.label
            }))
            .toArray();

        dispatch({
            type: 'SUBSCRIPTIONS_FETCHED',
            fetchedAt: new Date().toISOString(),
            categories,
            subscriptions
        });
    };
}

export function subscribeFeed(feed: Feed, categoryIds: (string | number)[]): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_SUBSCRIBING',
            feedId: feed.feedId
        });

        const { token } = await getCredential()(dispatch, getState);

        await feedly.subscribeFeed(token.access_token, {
            id: feed.feedId as string,
            categories: categoryIds.map((id) => ({ id: id as string }))
        });

        const unreadCounts = await feedly.getUnreadCounts(token.access_token, {
            streamId: feed.streamId
        });
        const unreadCount = unreadCounts.unreadcounts.find(unreadCount => unreadCount.id === feed.streamId);

        const subscription = {
            subscriptionId: feed.feedId,
            streamId: feed.streamId,
            feedId: feed.feedId,
            categoryIds,
            title: feed.title,
            iconUrl: feed.iconUrl,
            unreadCount: unreadCount ? unreadCount.count : 0
        };

        dispatch({
            type: 'FEED_SUBSCRIBED',
            feedId: feed.feedId,
            subscription
        });
    };
}

export function unsubscribeFeed(feedId: string | number): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_SUBSCRIBING',
            feedId
        });

        const { token } = await getCredential()(dispatch, getState);

        await feedly.unsubscribeFeed(token.access_token, feedId as string);

        dispatch({
            type: 'FEED_UNSUBSCRIBED',
            feedId
        });
    };
}

export function createCategory(label: string): AsyncEvent<Promise<Category>> {
    return async (dispatch, getState) => {
        const { token } = await getCredential()(dispatch, getState);

        const categoryId = `users/${token.id}/category/${label}`;

        return {
            categoryId,
            streamId: categoryId,
            label
        };
    };
}
