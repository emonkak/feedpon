import type { Reactive } from 'barebind/extras/reactive';
import type * as v from 'valibot';

import type {
  Category,
  Feed,
  Subscription,
  UnreadCount,
} from '../apis/feedly.ts';
import { ImmutableMap } from '../collections/ImmutableMap.ts';
import {
  type Comparer,
  orderByAscending,
  orderByDescending,
} from '../utils/compare.ts';
import { type AuthContext, type AuthState, acquireCredential } from './auth.ts';

export type Category = v.InferOutput<typeof Category>;

export type Feed = v.InferOutput<typeof Feed>;

export type Subscription = v.InferOutput<typeof Subscription>;

export type SubscriptionAction<TResult> = (
  context: SubscriptionContext,
) => TResult;

export interface SubscriptionContext extends AuthContext {
  state$: Reactive<{
    authState: AuthState;
    subscriptionState: SubscriptionState;
  }>;
}

export interface SubscriptionGroup {
  category: Category;
  items: SubscriptionItem[];
  unreadCount: number;
}

export interface SubscriptionItem {
  subscription: Subscription;
  unreadCount: number;
}

export type SubscriptionOrder = 'id' | 'title' | 'newest' | 'oldest';

export interface SubscriptionTree {
  subscriptionGroups: SubscriptionGroup[];
  ungroupedItems: SubscriptionItem[];
}

export type UnreadCount = v.InferOutput<typeof UnreadCount>;

export class SubscriptionState {
  categories: ImmutableMap<Category['id'], Category> = ImmutableMap.empty();
  lastUpdated: number = -1;
  loading: boolean = false;
  onlyUnread: boolean = true;
  opmlImporting: boolean = false;
  order: SubscriptionOrder = 'id';
  subscriptions: ImmutableMap<Subscription['id'], Subscription> =
    ImmutableMap.empty();
  unreadCounts: ImmutableMap<UnreadCount['id'], UnreadCount> =
    ImmutableMap.empty();

  get totalUnreadCount(): number {
    return this.unreadCounts
      .values()
      .reduce((totalCount, { count }) => totalCount + count, 0);
  }

  get sortedSubscriptions(): Subscription[] {
    return this.subscriptions
      .values()
      .toArray()
      .sort(getSubscriptionComparer(this.order));
  }

  get subscriptionTree(): SubscriptionTree {
    const sortedSubscriptions = this.sortedSubscriptions;
    const subscriptionGroups = new Map<string, SubscriptionGroup>();
    const ungroupedItems: SubscriptionItem[] = [];

    for (let i = 0, l = sortedSubscriptions.length; i < l; i++) {
      const subscription = sortedSubscriptions[i]!;
      const unreadCount = this.unreadCounts.get(subscription.id)?.count ?? 0;

      if (this.onlyUnread && unreadCount === 0) {
        continue;
      }

      const item = { subscription, unreadCount };

      if (subscription.categories.length > 0) {
        for (let j = 0, m = subscription.categories.length; j < m; j++) {
          const category = subscription.categories[i]!;
          const group = subscriptionGroups.get(category.id);

          if (group !== undefined) {
            group.items.push(item);
            group.unreadCount += unreadCount;
          } else {
            subscriptionGroups.set(category.id, {
              category,
              items: [item],
              unreadCount,
            });
          }
        }
      } else {
        ungroupedItems.push(item);
      }
    }

    return {
      subscriptionGroups: Array.from(subscriptionGroups.values()).sort(
        orderByAscending(({ category }) => category.label),
      ),
      ungroupedItems,
    };
  }
}

export function createCategory(
  label: string,
): SubscriptionAction<Promise<void>> {
  return (context) => {
    const { state$ } = context;
    const subscriptionState$ = state$.get('subscriptionState');

    return subscriptionState$.mutate(async (state) => {
      const credential = await acquireCredential(context);
      const category = toCategory(credential.id, label);

      state.categories = state.categories.set(category.id, category);
    });
  };
}

export function deleteCategory(id: string): SubscriptionAction<void> {
  return ({ state$ }) => {
    const subscriptionState$ = state$.get('subscriptionState');
    const categories$ = subscriptionState$.get('categories');
    const subscriptions$ = subscriptionState$.get('subscriptions');

    categories$.value = categories$.value
      .values()
      .reduce(
        (categories, category) =>
          category.id === id ? categories.delete(category.id) : categories,
        categories$.value,
      );

    subscriptions$.value = ImmutableMap.from(
      subscriptions$.value.values(),
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
  };
}

export function importOpml(
  opmlString: string,
): SubscriptionAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;
    const subscriptionState$ = state$.get('subscriptionState');

    return subscriptionState$.mutate(async (state) => {
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
): SubscriptionAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;
    const subscriptionState$ = state$.get('subscriptionState');

    return subscriptionState$.mutate(async (state) => {
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

export function reloadSubscriptions(): SubscriptionAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;
    const subscriptionState$ = state$.get('subscriptionState');

    return subscriptionState$.mutate(async (state) => {
      state.loading = true;

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
          unreadCount,
        ]);

        state.lastUpdated = Date.now();
      } finally {
        state.loading = false;
      }
    });
  };
}

export function sortSubscriptions(
  order: SubscriptionOrder,
): SubscriptionAction<void> {
  return ({ state$ }) => {
    const subscriptionState$ = state$.get('subscriptionState');

    subscriptionState$.mutate((state) => {
      state.order = order;
    });
  };
}

export function subscribeToFeed(
  feed: Feed,
  labels: string[],
): SubscriptionAction<Promise<void>> {
  return (context) => {
    const { feedlyClient, state$ } = context;
    const subscriptionState$ = state$.get('subscriptionState');

    return subscriptionState$.mutate(async (state) => {
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
        state.unreadCounts = state.unreadCounts.set(
          unreadCounts[0]!.id,
          unreadCounts[0]!,
        );
      }
    });
  };
}

export function toggleOnlyUnread(
  onlyUnread: boolean,
): SubscriptionAction<void> {
  return ({ state$ }) => {
    const subscriptionState$ = state$.get('subscriptionState');

    subscriptionState$.mutate((state) => {
      state.onlyUnread = onlyUnread;
    });
  };
}

export function unsubscribeFromFeed(
  feed: Feed,
): SubscriptionAction<Promise<void>> {
  return (context) => {
    const { state$, feedlyClient } = context;
    const subscriptionState$ = state$.get('subscriptionState');

    return subscriptionState$.mutate(async (state) => {
      const credential = await acquireCredential(context);

      await feedlyClient.unsubscribeFromFeed(credential.accessToken, feed.id);

      state.subscriptions = state.subscriptions.delete(feed.id);
      state.unreadCounts = state.unreadCounts.delete(feed.id);
    });
  };
}

export function updateCategory(
  id: string,
  newLabel: string,
): SubscriptionAction<void> {
  return (context) => {
    const { state$ } = context;
    const subscriptionState$ = state$.get('subscriptionState');

    return subscriptionState$.mutate(async (state) => {
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

function getSubscriptionComparer(
  order: SubscriptionOrder,
): Comparer<Subscription> {
  switch (order) {
    case 'id':
      return orderByAscending((subscription) => subscription.id);
    case 'title':
      return orderByAscending((subscription) => subscription.title);
    case 'newest':
      return orderByDescending((subscription) => subscription.updated);
    case 'oldest':
      return orderByAscending((subscription) => subscription.updated);
  }
}

function toCategory(userId: string, label: string): Category {
  return { id: `user/${userId}/category/${label}`, label };
}
