import type { AppAction } from '../action.ts';
import { ImmutableMap } from '../collections/ImmutableMap.ts';
import type {
  Category,
  Feed,
  Subscription,
  SubscriptionsSettings,
} from '../state.ts';
import { acquireCredential } from './auth.ts';

export function createCategory(label: string): AppAction<Promise<void>> {
  return (context) => {
    const { state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential()(context);
      const category = toCategory(credential.id, label);

      state.categories = state.categories.set(category.id, category);
    });
  };
}

export function createSubscription(
  feed: Feed,
  labels: string[],
): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential()(context);
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
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential()(context);
      const previousCategories = state.categories;
      const previousSubscriptions = state.subscriptions;

      state.categories = previousCategories
        .values()
        .reduce(
          (categories, category) =>
            category.id === categoryId
              ? categories.delete(category.id)
              : categories,
          state.categories,
        );

      state.subscriptions = ImmutableMap.from(
        previousSubscriptions.values(),
        (subscription) => [
          subscription.id,
          {
            ...subscription,
            categories: subscription.categories.filter(
              (category) => category.id !== categoryId,
            ),
          },
        ],
      );

      try {
        await feedlyClient.deleteCategory(credential.accessToken, categoryId);
      } catch (error) {
        state.categories = previousCategories;
        state.subscriptions = previousSubscriptions;
        throw error;
      }
    });
  };
}

export function deleteSubscription(
  subscriptionId: string,
): AppAction<Promise<void>> {
  return (context) => {
    const { state$, feedlyClient } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential()(context);
      const previousSubscriptions = state.subscriptions;
      const previousUnreadCounts = state.unreadCounts;

      state.subscriptions = previousSubscriptions.delete(subscriptionId);
      state.unreadCounts = previousUnreadCounts.delete(subscriptionId);

      try {
        await feedlyClient.unsubscribeFromFeed(
          credential.accessToken,
          subscriptionId,
        );
      } catch (error) {
        state.subscriptions = previousSubscriptions;
        state.unreadCounts = previousUnreadCounts;
        throw error;
      }
    });
  };
}

export function exportOpml(): AppAction<Promise<URL>> {
  return async (context) => {
    const { feedlyClient } = context;
    const credential = await acquireCredential()(context);
    const url = new URL('v3/opml', feedlyClient.baseUrl);
    url.searchParams.append('feedlyToken', credential.accessToken);
    return url;
  };
}

export function importOpml(opmlString: string): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      state.opmlImporting = true;

      try {
        const credential = await acquireCredential()(context);

        await feedlyClient.importOPML(credential.accessToken, opmlString);
      } finally {
        state.opmlImporting = false;
      }
    });
  };
}

export function reloadSubscriptions(): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      state.subscriptionsLoading = true;

      try {
        const credential = await acquireCredential()(context);
        const [subscriptions, { unreadcounts }] = await Promise.all([
          await feedlyClient.getSubscriptions(credential.accessToken),
          await feedlyClient.getUnreadCounts(credential.accessToken),
        ]);

        state.categories = ImmutableMap.from(
          Iterator.from(subscriptions).flatMap(
            (subscription) => subscription.categories,
          ),
          (category) => [category.id, category],
        );

        state.subscriptions = ImmutableMap.from(
          subscriptions,
          (subscription) => [subscription.id, subscription],
        );

        state.unreadCounts = ImmutableMap.from(unreadcounts, (unreadCount) => [
          unreadCount.id,
          unreadCount.count,
        ]);

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
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential()(context);
      const previousCategories = state.categories;
      const previousSubscriptions = state.subscriptions;
      const newCategory = toCategory(credential.id, newLabel);

      state.categories = previousCategories
        .values()
        .reduce(
          (categories, oldCategory) =>
            oldCategory.id === categoryId
              ? categories
                  .set(newCategory.id, newCategory)
                  .delete(oldCategory.id)
              : categories,
          state.categories,
        );

      state.subscriptions = ImmutableMap.from(
        previousSubscriptions.values(),
        (subscription) => [
          subscription.id,
          {
            ...subscription,
            categories: subscription.categories.map((category) =>
              category.id === categoryId ? newCategory : category,
            ),
          },
        ],
      );

      try {
        await feedlyClient.updateCategory(credential.accessToken, categoryId, {
          label: newLabel,
        });
      } catch (error) {
        state.categories = previousCategories;
        state.subscriptions = previousSubscriptions;
        throw error;
      }
    });
  };
}

export function updateSubscription(
  subscriptionId: string,
  newLabels: string[],
): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential()(context);
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
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.subscriptionsSettings = subscriptionsSettings;
    });
  };
}

function toCategory(userId: string, label: string): Category {
  return { id: `user/${userId}/category/${label}`, label };
}
