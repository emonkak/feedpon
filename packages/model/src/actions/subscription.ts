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
  return async (state$, _context, dispatch) => {
    const categories$ = state$.get('categories');

    const credential = await dispatch(acquireCredential());
    const category = toCategory(credential.id, label);

    categories$.value = categories$.value.set(category.id, category);
  };
}

export function createSubscription(
  feed: Feed,
  labels: string[],
): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const subscriptions$ = state$.get('subscriptions');
    const unreadCounts$ = state$.get('unreadCounts');

    const credential = await dispatch(acquireCredential());
    const categories = labels.map((label) => toCategory(credential.id, label));

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

    subscriptions$.value = subscriptions$.value.set(
      subscription.id,
      subscription,
    );

    if (unreadcounts.length > 0) {
      const { id, count } = unreadcounts[0]!;
      unreadCounts$.value = unreadCounts$.value.set(id, count);
    }
  };
}

export function deleteCategory(categoryId: string): AppAction<Promise<void>> {
  return async (state$, context, dispatch) => {
    const categories$ = state$.get('categories');
    const subscriptions$ = state$.get('subscriptions');
    const { feedlyClient } = context;

    const credential = await dispatch(acquireCredential());
    const prevCategories = categories$.value;
    const prevSubscriptions = subscriptions$.value;

    categories$.value = prevCategories
      .values()
      .reduce(
        (categories, category) =>
          category.id === categoryId
            ? categories.delete(category.id)
            : categories,
        prevCategories,
      );
    subscriptions$.value = prevSubscriptions.values().reduce(
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
      categories$.value = prevCategories;
      subscriptions$.value = prevSubscriptions;
      throw error;
    }
  };
}

export function deleteSubscription(
  subscriptionId: string,
): AppAction<Promise<void>> {
  return async (state$, context, dispatch) => {
    const subscriptions$ = state$.get('subscriptions');
    const unreadCounts$ = state$.get('unreadCounts');
    const { feedlyClient } = context;

    const credential = await dispatch(acquireCredential());
    const prevSubscriptions = subscriptions$.value;
    const prevUnreadCounts = unreadCounts$.value;

    subscriptions$.value = prevSubscriptions.delete(subscriptionId);
    unreadCounts$.value = prevUnreadCounts.delete(subscriptionId);

    try {
      await feedlyClient.unsubscribeFromFeed(
        credential.accessToken,
        subscriptionId,
      );
    } catch (error) {
      subscriptions$.value = prevSubscriptions;
      unreadCounts$.value = prevUnreadCounts;
      throw error;
    }
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
  return async (state$, { feedlyClient }, dispatch) => {
    const opmlImporting$ = state$.get('opmlImporting');
    opmlImporting$.value = true;
    try {
      const credential = await dispatch(acquireCredential());
      await feedlyClient.importOPML(credential.accessToken, opmlString);
    } finally {
      opmlImporting$.value = false;
    }
  };
}

export function reloadSubscriptions(): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const categories$ = state$.get('categories');
    const readCounts$ = state$.get('readCounts');
    const unreadCounts$ = state$.get('unreadCounts');
    const subscriptions$ = state$.get('subscriptions');
    const subscriptionsLoading$ = state$.get('subscriptionsLoading');
    const subscriptionsUpdated$ = state$.get('subscriptionsUpdated');

    subscriptionsLoading$.value = true;

    try {
      const credential = await dispatch(acquireCredential());
      const [subscriptions, { unreadcounts }] = await Promise.all([
        await feedlyClient.getSubscriptions(credential.accessToken),
        await feedlyClient.getUnreadCounts(credential.accessToken),
      ]);

      categories$.value = Iterator.from(subscriptions)
        .flatMap((subscription) => subscription.categories)
        .reduce(
          (categories, category) => categories.set(category.id, category),
          ImmutableMap.empty<Category['id'], Category>(),
        );

      subscriptions$.value = subscriptions.reduce(
        (subscriptions, subscription) =>
          subscriptions.set(subscription.id, subscription),
        ImmutableMap.empty<Subscription['id'], Subscription>(),
      );

      readCounts$.value = ImmutableMap.empty();

      unreadCounts$.value = unreadcounts.reduce(
        (unreadCounts, unreadCount) =>
          unreadCounts.set(unreadCount.id, unreadCount.count),
        ImmutableMap.empty<UnreadCount['id'], UnreadCount['count']>(),
      );

      subscriptionsUpdated$.value = Date.now();
    } finally {
      subscriptionsLoading$.value = false;
    }
  };
}

export function updateCategory(
  categoryId: string,
  newLabel: string,
): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const categories$ = state$.get('categories');
    const subscriptions$ = state$.get('subscriptions');

    const credential = await dispatch(acquireCredential());
    const prevCategories = categories$.value;
    const prevSubscriptions = subscriptions$.value;
    const newCategory = toCategory(credential.id, newLabel);

    categories$.value = prevCategories
      .values()
      .reduce(
        (categories, oldCategory) =>
          oldCategory.id === categoryId
            ? categories.set(categoryId, newCategory)
            : categories,
        categories$.value,
      );

    subscriptions$.value = prevSubscriptions.values().reduce(
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
      categories$.value = prevCategories;
      subscriptions$.value = prevSubscriptions;
      throw error;
    }
  };
}

export function updateSubscription(
  subscriptionId: string,
  newLabels: string[],
): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const subscriptions$ = state$.get('subscriptions');

    const credential = await dispatch(acquireCredential());
    const previousSubscriptions = subscriptions$.value;
    const newCategories = newLabels.map((label) =>
      toCategory(credential.id, label),
    );

    subscriptions$.value = previousSubscriptions.update(
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
      subscriptions$.value = previousSubscriptions;
      throw error;
    }
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
