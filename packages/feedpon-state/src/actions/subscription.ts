import type { AppAction } from '../action.ts';
import { ImmutableMap } from '../collections/ImmutableMap.ts';
import type {
  Category,
  Feed,
  Subscription,
  SubscriptionOrdering,
} from '../state.ts';
import { acquireCredential } from './auth.ts';

export function createCategory(label: string): AppAction<Promise<void>> {
  return (context) => {
    const { state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential(context);
      const category = toCategory(credential.id, label);

      state.categories = state.categories.set(category.id, category);
    });
  };
}

export function deleteCategory(id: string): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.categories = state.categories
        .values()
        .reduce(
          (categories, category) =>
            category.id === id ? categories.delete(category.id) : categories,
          state.categories,
        );

      state.subscriptions = ImmutableMap.from(
        state.subscriptions.values(),
        (subscription) => [
          subscription.id,
          {
            ...subscription,
            categories: subscription.categories.filter(
              (category) => category.id !== id,
            ),
          },
        ],
      );
    });
  };
}

export function importOpml(opmlString: string): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      state.opmlImporting = true;

      try {
        const credential = await acquireCredential(context);

        await feedlyClient.importOPML(credential.accessToken, opmlString);
      } finally {
        state.opmlImporting = false;
      }
    });
  };
}

export function moveSubscription(
  subscriptionId: string,
  labels: string[],
): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential(context);
      const categories = labels.map((label) =>
        toCategory(credential.id, label),
      );

      await feedlyClient.updateSubscription(credential.accessToken, {
        id: subscriptionId,
        categories,
      });

      state.subscriptions = state.subscriptions.update(
        subscriptionId,
        (subscription) => {
          return {
            ...subscription,
            categories,
          };
        },
      );
    });
  };
}

export function reloadSubscriptions(): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      state.subscriptionsLoading = true;

      try {
        const credential = await acquireCredential(context);
        const [subscriptions, { unreadCounts }] = await Promise.all([
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

        state.unreadCounts = ImmutableMap.from(unreadCounts, (unreadCount) => [
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

export function sortSubscriptions(
  order: SubscriptionOrdering,
): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.subscriptionsSettings = { ...state.subscriptionsSettings, order };
    });
  };
}

export function subscribeToFeed(
  feed: Feed,
  labels: string[],
): AppAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential(context);
      const categories = labels.map((label) =>
        toCategory(credential.id, label),
      );

      await feedlyClient.subscrieToFeed(credential.accessToken, {
        id: feed.id,
        categories,
      });

      const { unreadCounts } = await feedlyClient.getUnreadCounts(
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

      if (unreadCounts.length > 0) {
        const { id, count } = unreadCounts[0]!;
        state.unreadCounts = state.unreadCounts.set(id, count);
      }
    });
  };
}

export function toggleOnlyUnread(onlyUnread: boolean): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.subscriptionsSettings = {
        ...state.subscriptionsSettings,
        onlyUnread,
      };
    });
  };
}

export function unsubscribeFromFeed(feed: Feed): AppAction<Promise<void>> {
  return (context) => {
    const { state$, feedlyClient } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential(context);

      await feedlyClient.unsubscribeFromFeed(credential.accessToken, feed.id);

      state.subscriptions = state.subscriptions.delete(feed.id);
      state.unreadCounts = state.unreadCounts.delete(feed.id);
    });
  };
}

export function updateCategory(id: string, newLabel: string): AppAction<void> {
  return (context) => {
    const { state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential(context);
      const newCategory = toCategory(credential.id, newLabel);

      state.categories = state.categories
        .values()
        .reduce(
          (categories, oldCategory) =>
            oldCategory.id === id
              ? categories
                  .set(newCategory.id, newCategory)
                  .delete(oldCategory.id)
              : categories,
          state.categories,
        );

      state.subscriptions = ImmutableMap.from(
        state.subscriptions.values(),
        (subscription) => [
          subscription.id,
          {
            ...subscription,
            categories: subscription.categories.map((category) =>
              category.id === id ? newCategory : category,
            ),
          },
        ],
      );
    });
  };
}

function toCategory(userId: string, label: string): Category {
  return { id: `user/${userId}/category/${label}`, label };
}
