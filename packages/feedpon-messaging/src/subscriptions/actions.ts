import * as feedly from 'feedpon-adapters/feedly';
import createAscendingComparer from 'feedpon-utils/createAscendingComparer';
import { getFeedlyToken } from '../backend/actions';
import type {
  AsyncThunk,
  Event,
  Feed,
  Subscription,
  SubscriptionOrderKind,
} from '../index';

export function fetchSubscriptions(): AsyncThunk {
  return async ({ dispatch }, { environment }) => {
    dispatch({
      type: 'SUBSCRIPTIONS_FETCHING',
    });

    try {
      const token = await dispatch(getFeedlyToken());

      const [feedlySubscriptions, feedlyUnreadCounts] = await Promise.all([
        feedly.getSubscriptions(environment.endPoint, token.access_token),
        feedly.getUnreadCounts(environment.endPoint, token.access_token),
      ]);

      const unreadCountsById = feedlyUnreadCounts.unreadcounts.reduce(
        (map, unreadCount) => {
          map.set(unreadCount.id, unreadCount);
          return map;
        },
        new Map<string, feedly.UnreadCount>(),
      );

      const subscriptions = feedlySubscriptions.map((subscription) => {
        const unreadCount = unreadCountsById.get(subscription.id);
        return {
          subscriptionId: subscription.id,
          streamId: subscription.id,
          feedId: subscription.id,
          labels: subscription.categories.map((category) => category.label),
          title: subscription.title ?? '',
          url: subscription.website ?? '',
          feedUrl: subscription.id.replace(/feed\//, ''),
          iconUrl: subscription.iconUrl || '',
          unreadCount: unreadCount?.count ?? 0,
          readCount: 0,
          updatedAt: unreadCount?.updated ?? 0,
          isLoading: false,
        };
      });

      const visitedCategoryIds = new Set<string>();

      const categories = feedlySubscriptions
        .flatMap((subscription) => subscription.categories)
        .filter((category) => {
          const id = category.id;
          if (visitedCategoryIds.has(id)) {
            return false;
          }
          visitedCategoryIds.add(id);
          return true;
        })
        .sort(createAscendingComparer('label'))
        .map((category) => ({
          categoryId: category.id,
          streamId: category.id,
          label: category.label,
          isLoading: false,
        }));

      dispatch({
        type: 'SUBSCRIPTIONS_FETCHED',
        fetchedAt: Date.now(),
        categories,
        subscriptions,
      });
    } catch (error) {
      dispatch({
        type: 'SUBSCRIPTIONS_FETCHING_FAILED',
      });

      throw error;
    }
  };
}

export function addToCategory(
  subscription: Subscription,
  labelToAdd: string,
): AsyncThunk {
  return async ({ dispatch }, { environment }) => {
    dispatch({
      type: 'FEED_SUBSCRIBING',
      feedId: subscription.feedId,
    });

    try {
      const token = await dispatch(getFeedlyToken());

      const labels = Array.from(new Set([...subscription.labels, labelToAdd]));
      const categories = labels.map((label) => ({
        id: `user/${token.id}/category/${label}`,
        label,
      }));

      await feedly.subscribeFeed(environment.endPoint, token.access_token, {
        id: subscription.feedId as string,
        categories,
      });

      dispatch({
        type: 'FEED_SUBSCRIBED',
        subscription: {
          ...subscription,
          labels,
        },
      });
    } catch (error) {
      dispatch({
        type: 'FEED_SUBSCRIBING_FAILED',
        feedId: subscription.feedId,
      });

      throw error;
    }
  };
}

export function removeFromCategory(
  subscription: Subscription,
  labelToRemove: string,
): AsyncThunk {
  return async ({ dispatch }, { environment }) => {
    dispatch({
      type: 'FEED_SUBSCRIBING',
      feedId: subscription.feedId,
    });

    try {
      const token = await dispatch(getFeedlyToken());

      const labels = subscription.labels.filter(
        (label) => label !== labelToRemove,
      );
      const categories = labels.map((label) => ({
        id: `user/${token.id}/category/${label}`,
        label,
      }));

      await feedly.subscribeFeed(environment.endPoint, token.access_token, {
        id: subscription.feedId as string,
        categories,
      });

      dispatch({
        type: 'FEED_SUBSCRIBED',
        subscription: {
          ...subscription,
          labels,
        },
      });
    } catch (error) {
      dispatch({
        type: 'FEED_SUBSCRIBING_FAILED',
        feedId: subscription.feedId,
      });

      throw error;
    }
  };
}

export function subscribe(feed: Feed, labels: string[]): AsyncThunk {
  return async ({ dispatch }, { environment }) => {
    dispatch({
      type: 'FEED_SUBSCRIBING',
      feedId: feed.feedId,
    });

    try {
      const token = await dispatch(getFeedlyToken());

      const categories = labels.map((label) => ({
        id: `user/${token.id}/category/${label}`,
        label,
      }));

      await feedly.subscribeFeed(environment.endPoint, token.access_token, {
        id: feed.feedId as string,
        categories,
      });

      const unreadCounts = await feedly.getUnreadCounts(
        environment.endPoint,
        token.access_token,
        {
          streamId: feed.streamId,
        },
      );
      const unreadCount = unreadCounts.unreadcounts.find(
        (unreadCount) => unreadCount.id === feed.streamId,
      );

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
          isLoading: false,
        },
      });
    } catch (error) {
      dispatch({
        type: 'FEED_SUBSCRIBING_FAILED',
        feedId: feed.feedId,
      });

      throw error;
    }
  };
}

export function unsubscribe(subscription: Subscription): AsyncThunk {
  return async ({ dispatch }, { environment }) => {
    dispatch({
      type: 'FEED_UNSUBSCRIBING',
      feedId: subscription.feedId,
    });

    try {
      const token = await dispatch(getFeedlyToken());

      await feedly.unsubscribeFeed(
        environment.endPoint,
        token.access_token,
        subscription.feedId as string,
      );

      dispatch({
        type: 'FEED_UNSUBSCRIBED',
        feedId: subscription.feedId,
      });
    } catch (error) {
      dispatch({
        type: 'FEED_UNSUBSCRIBING_FAILED',
        feedId: subscription.feedId,
      });

      throw error;
    }
  };
}

export function changeSubscriptionOrder(order: SubscriptionOrderKind): Event {
  return {
    type: 'SUBSCRIPTIONS_ORDER_CHANGED',
    order,
  };
}

export function changeOnlyUnread(onlyUnread: boolean): Event {
  return {
    type: 'SUBSCRIPTIONS_ONLY_UNREAD',
    onlyUnread,
  };
}

export function importOpml(xmlString: string): AsyncThunk {
  return async ({ dispatch }, { environment }) => {
    await dispatch({
      type: 'SUBSCRIPTIONS_IMPORTING',
    });

    try {
      const token = await dispatch(getFeedlyToken());

      await feedly.importOpml(
        environment.endPoint,
        token.access_token,
        xmlString,
      );

      await dispatch(fetchSubscriptions());
    } finally {
      await dispatch({
        type: 'SUBSCRIPTIONS_IMPORTING_DONE',
      });
    }
  };
}
