import { ImmutableMap } from '@feedpon/foundation';
import type {
  AppAction,
  Category,
  Feed,
  Subscription,
  SubscriptionsSettings,
  UnreadCount,
} from '../index.ts';
import { acquireCredential } from './auth.ts';

export function createCategory(label: string): AppAction<Promise<void>> {
  return (state$, _context, dispatch) => {
    return state$.scope(async (state) => {
      const credential = await dispatch(acquireCredential());
      const category = toCategory(credential.id, label);

      state.categories = state.categories.set(category.id, category);
    });
  };
}

export function createSubscription(
  feed: Feed,
  labels: string[],
): AppAction<Promise<void>> {
  return (state$, { feedlyClient }, dispatch) => {
    return state$.scope(async (state) => {
      const credential = await dispatch(acquireCredential());
      const categories = labels.map((label) =>
        toCategory(credential.id, label),
      );

      await feedlyClient.subscrieToFeed(credential.accessToken, {
        id: feed.id,
        categories,
      });

      const { unreadcounts } = await feedlyClient.getUnreadCounts(
        credential.accessToken,
        {
          streamId: feed.id,
        },
      );

      const subscription: Subscription = {
        id: feed.id,
        title: feed.title,
        categories,
        website: feed.website,
        velocity: feed.velocity,
        topics: feed.topics,
      };

      state.subscriptions = state.subscriptions.set(
        subscription.id,
        subscription,
      );

      if (unreadcounts.length > 0) {
        const { id, count } = unreadcounts[0]!;
        state.unreadCounts = state.unreadCounts.set(id, count);
      }
    });
  };
}

export function deleteCategory(categoryId: string): AppAction<Promise<void>> {
  return (state$, context, dispatch) => {
    const { feedlyClient } = context;

    return state$.scope(async (state) => {
      const credential = await dispatch(acquireCredential());
      const latestCategories = state.categories;
      const latestSubscriptions = state.subscriptions;

      state.categories = latestCategories
        .values()
        .reduce(
          (categories, category) =>
            category.id === categoryId
              ? categories.delete(category.id)
              : categories,
          state.categories,
        );

      state.subscriptions = latestSubscriptions.values().reduce(
        (subscriptions, subscription) =>
          subscriptions.set(subscription.id, {
            ...subscription,
            categories: subscription.categories.filter(
              (category) => category.id !== categoryId,
            ),
          }),
        ImmutableMap.empty<Subscription['id'], Subscription>(),
      );

      try {
        await feedlyClient.deleteCategory(credential.accessToken, categoryId);
      } catch (error) {
        state.categories = latestCategories;
        state.subscriptions = latestSubscriptions;
        throw error;
      }
    });
  };
}

export function deleteSubscription(
  subscriptionId: string,
): AppAction<Promise<void>> {
  return (state$, context, dispatch) => {
    const { feedlyClient } = context;

    return state$.scope(async (state) => {
      const credential = await dispatch(acquireCredential());
      const latestSubscriptions = state.subscriptions;
      const latestUnreadCounts = state.unreadCounts;

      state.subscriptions = latestSubscriptions.delete(subscriptionId);
      state.unreadCounts = latestUnreadCounts.delete(subscriptionId);

      try {
        await feedlyClient.unsubscribeFromFeed(
          credential.accessToken,
          subscriptionId,
        );
      } catch (error) {
        state.subscriptions = latestSubscriptions;
        state.unreadCounts = latestUnreadCounts;
        throw error;
      }
    });
  };
}

export function exportOpml(): AppAction<Promise<URL>> {
  return async (_state$, { feedlyClient }, dispatch) => {
    const credential = await dispatch(acquireCredential());
    const url = new URL('v3/opml', feedlyClient.baseUrl);
    url.searchParams.append('feedlyToken', credential.accessToken);
    return url;
  };
}

export function importOpml(opmlString: string): AppAction<Promise<void>> {
  return (state$, { feedlyClient }, dispatch) => {
    return state$.scope(async (state) => {
      state.opmlImporting = true;

      try {
        const credential = await dispatch(acquireCredential());
        await feedlyClient.importOPML(credential.accessToken, opmlString);
      } finally {
        state.opmlImporting = false;
      }
    });
  };
}

export function reloadSubscriptions(): AppAction<Promise<void>> {
  return (state$, { feedlyClient }, dispatch) => {
    return state$.scope(async (state) => {
      state.subscriptionsLoading = true;

      try {
        const credential = await dispatch(acquireCredential());
        const [subscriptions, { unreadcounts }] = await Promise.all([
          await feedlyClient.getSubscriptions(credential.accessToken),
          await feedlyClient.getUnreadCounts(credential.accessToken),
        ]);

        state.categories = Iterator.from(subscriptions)
          .flatMap((subscription) => subscription.categories)
          .reduce(
            (categories, category) => categories.set(category.id, category),
            ImmutableMap.empty<Category['id'], Category>(),
          );

        state.subscriptions = subscriptions.reduce(
          (subscriptions, subscription) =>
            subscriptions.set(subscription.id, subscription),
          ImmutableMap.empty<Subscription['id'], Subscription>(),
        );

        state.readCounts = ImmutableMap.empty();

        state.unreadCounts = unreadcounts.reduce(
          (unreadCounts, unreadCount) =>
            unreadCounts.set(unreadCount.id, unreadCount.count),
          ImmutableMap.empty<UnreadCount['id'], UnreadCount['count']>(),
        );

        state.subscriptionsUpdated = Date.now();
      } finally {
        state.subscriptionsLoading = false;
      }
    });
  };
}

export function updateCategory(
  categoryId: string,
  newLabel: string,
): AppAction<Promise<void>> {
  return (state$, { feedlyClient }, dispatch) => {
    return state$.scope(async (state) => {
      const credential = await dispatch(acquireCredential());
      const latestsCategories = state.categories;
      const latestSubscriptions = state.subscriptions;
      const newCategory = toCategory(credential.id, newLabel);

      state.categories = latestsCategories
        .values()
        .reduce(
          (categories, oldCategory) =>
            oldCategory.id === categoryId
              ? categories.set(categoryId, newCategory)
              : categories,
          state.categories,
        );

      state.subscriptions = latestSubscriptions.values().reduce(
        (subscriptions, subscription) =>
          subscriptions.set(subscription.id, {
            ...subscription,
            categories: subscription.categories.map((category) =>
              category.id === categoryId ? newCategory : category,
            ),
          }),
        ImmutableMap.empty<Subscription['id'], Subscription>(),
      );

      try {
        await feedlyClient.updateCategory(credential.accessToken, categoryId, {
          label: newLabel,
        });
      } catch (error) {
        state.categories = latestsCategories;
        state.subscriptions = latestSubscriptions;
        throw error;
      }
    });
  };
}

export function updateSubscription(
  subscriptionId: string,
  newLabels: string[],
): AppAction<Promise<void>> {
  return (state$, { feedlyClient }, dispatch) => {
    return state$.scope(async (state) => {
      const credential = await dispatch(acquireCredential());
      const previousSubscriptions = state.subscriptions;
      const newCategories = newLabels.map((label) =>
        toCategory(credential.id, label),
      );

      state.subscriptions = previousSubscriptions.update(
        subscriptionId,
        (subscription) => {
          return {
            ...subscription,
            categories: newCategories,
          };
        },
      );

      try {
        await feedlyClient.updateSubscription(credential.accessToken, {
          id: subscriptionId,
          categories: newCategories,
        });
      } catch (error) {
        state.subscriptions = previousSubscriptions;
        throw error;
      }
    });
  };
}

export function updateSubscriptionsSettings(
  subscriptionsSettings: SubscriptionsSettings,
): AppAction<void> {
  return (state$) => {
    state$.scope((state) => {
      state.subscriptionsSettings = subscriptionsSettings;
    });
  };
}

function toCategory(userId: string, label: string): Category {
  return { id: `user/${userId}/category/${label}`, label };
}
