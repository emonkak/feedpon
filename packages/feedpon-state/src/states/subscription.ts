import { Atom, Computed, type Signal } from 'barebind/extras/signal';

import { acquireAuth, type FeedlyContext } from '../api/feedly.ts';
import type * as Feedly from '../api/feedlyTypes.d.ts';
import type { AsyncAction, State, Store } from '../store.ts';
import {
  type Comparer,
  orderByAscending,
  orderByDescending,
} from '../utils/comparer.ts';
import { ImmutableMap } from '../utils/ImmutableMap.ts';

export interface SubscriptionSeed {
  lastUpdated: number;
  loading: boolean;
  order: SubscriptionOrder;
  subscriptions: Subscription[];
  unreadCounts: UnreadCount[];
  unreadOnly: boolean;
  version: number;
}

export type Category = Feedly.components['schemas']['Category'];

export type Feed = Feedly.components['schemas']['Feed'];

export type Subscription = Feedly.components['schemas']['Subscription'];

export type SubscriptionOrder = 'id' | 'title' | 'newest' | 'oldest';

export type UnreadCount = Feedly.components['schemas']['UnreadCount'];

export type ReadCount = UnreadCount;

export interface SubscriptionTree {
  subscriptionGroups: SubscriptionGroup[];
  ungroupedItems: SubscriptionItem[];
}

export interface SubscriptionItem {
  subscription: Subscription;
  unreadCount: number;
}

export interface SubscriptionGroup {
  category: Category;
  items: SubscriptionItem[];
  unreadCount: number;
}

export interface SubscriptionContext extends FeedlyContext {
  subscriptionStore: Store<SubscriptionState>;
}

const defaultSeed: SubscriptionSeed = {
  lastUpdated: -1,
  loading: false,
  order: 'id',
  subscriptions: [],
  unreadCounts: [],
  unreadOnly: true,
  version: 1,
};

export class SubscriptionState implements State<SubscriptionSeed> {
  readonly categories$: Signal<Category[]>;

  readonly lastUpdated$: Atom<number>;

  readonly loading$: Atom<boolean>;

  readonly order$: Atom<SubscriptionOrder>;

  readonly subscriptions$: Atom<ImmutableMap<Subscription['id'], Subscription>>;

  readonly subscriptionTree$: Signal<SubscriptionTree>;

  readonly totalUnreadCount$: Signal<number>;

  readonly unreadCounts$: Atom<ImmutableMap<UnreadCount['id'], UnreadCount>>;

  readonly unreadOnly$: Atom<boolean>;

  readonly version$: Atom<number>;

  constructor(seed: SubscriptionSeed = defaultSeed) {
    this.lastUpdated$ = new Atom(seed.lastUpdated);
    this.loading$ = new Atom(false);
    this.order$ = new Atom(seed.order);
    this.subscriptions$ = new Atom(
      ImmutableMap.from(seed.subscriptions, (subscription) => [
        subscription.id,
        subscription,
      ]),
    );
    this.unreadCounts$ = new Atom(
      ImmutableMap.from(seed.unreadCounts, (unreadCount) => [
        unreadCount.id,
        unreadCount,
      ]),
    );
    this.unreadOnly$ = new Atom(seed.unreadOnly);
    this.version$ = new Atom(seed.version);

    this.totalUnreadCount$ = new Computed(
      (unreadCounts) =>
        unreadCounts.values().reduce((total, { count }) => total + count, 0),
      [this.unreadCounts$],
    );

    const sortedSubscriptions$ = new Computed(
      (subscriptions, order) =>
        subscriptions.values().toArray().sort(getSubscriptionComparer(order)),
      [this.subscriptions$, this.order$],
    );

    this.subscriptionTree$ = new Computed(
      (subscriptions, unreadCounts, unreadOnly) => {
        const subscriptionGroups = new Map<string, SubscriptionGroup>();
        const ungroupedItems: SubscriptionItem[] = [];

        for (let i = 0, l = subscriptions.length; i < l; i++) {
          const subscription = subscriptions[i]!;
          const unreadCount = unreadCounts.get(subscription.id)?.count ?? 0;

          if (unreadOnly && unreadCount === 0) {
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
      },
      [sortedSubscriptions$, this.unreadCounts$, this.unreadOnly$],
    );

    this.categories$ = new Computed(
      (subscriptionTree) =>
        subscriptionTree.subscriptionGroups.map(
          (subscriptionGroup) => subscriptionGroup.category,
        ),
      [this.subscriptionTree$],
    );
  }

  toSnapshot(): SubscriptionSeed {
    return {
      lastUpdated: this.lastUpdated$.value,
      loading: this.loading$.value,
      unreadCounts: Array.from(this.unreadCounts$.value.values()),
      order: this.order$.value,
      subscriptions: Array.from(this.subscriptions$.value.values()),
      unreadOnly: this.unreadOnly$.value,
      version: this.version$.value,
    };
  }

  addSubscription({
    subscription,
    unreadCount,
  }: {
    subscription: Subscription;
    unreadCount: UnreadCount;
  }): void {
    this.subscriptions$.value = this.subscriptions$.value.set(
      subscription.id,
      subscription,
    );
    this.unreadCounts$.value = this.unreadCounts$.value.set(
      unreadCount.id,
      unreadCount,
    );
  }

  removeSubscription({ id }: { id: string }): void {
    this.subscriptions$.value = this.subscriptions$.value.delete(id);
    this.unreadCounts$.value = this.unreadCounts$.value.delete(id);
  }

  failSubscriptions(): void {
    this.loading$.value = false;
  }

  moveSubscription({
    id,
    categories,
  }: {
    id: string;
    categories: Category[];
  }): void {
    this.subscriptions$.value = this.subscriptions$.value.update(
      id,
      (subscription) => {
        return {
          ...subscription,
          categories,
        };
      },
    );
  }

  receiveSubscriptions({
    subscriptions,
    unreadCounts,
  }: {
    subscriptions: Subscription[];
    unreadCounts: UnreadCount[];
  }) {
    this.loading$.value = false;
    this.lastUpdated$.value = Date.now();
    this.subscriptions$.value = ImmutableMap.from(
      subscriptions,
      (subscription) => [subscription.id, subscription],
    );
    this.unreadCounts$.value = ImmutableMap.from(
      unreadCounts,
      (unreadCount) => [unreadCount.id, unreadCount],
    );
  }

  requestSubscriptions(): void {
    this.loading$.value = true;
  }

  setOrder({ newOrder }: { newOrder: SubscriptionOrder }): void {
    this.order$.value = newOrder;
  }

  setUnreadOnly({ newUnreadOnly }: { newUnreadOnly: boolean }): void {
    this.unreadOnly$.value = newUnreadOnly;
  }
}

export function moveSubscription(
  id: string,
  labels: string[],
): AsyncAction<SubscriptionContext> {
  return async ({
    authStore,
    feedlyClient,
    subscriptionStore,
    authenticator,
  }) => {
    const auth = await acquireAuth()({
      authStore,
      feedlyClient,
      authenticator,
    });

    const categories = labels.map((label) => ({
      id: `user/${auth.id}/category/${label}`,
      label,
    }));

    await feedlyClient.POST('/subscriptions', {
      body: {
        id,
        categories,
      },
    });

    subscriptionStore.dispatch({
      type: 'moveSubscription',
      id,
      categories,
    });
  };
}

export function reloadSubscriptions(): AsyncAction<SubscriptionContext> {
  return async ({ feedlyClient, subscriptionStore }) => {
    subscriptionStore.dispatch({
      type: 'requestSubscriptions',
    });

    try {
      const [{ data: subscriptions }, { data: unreadCounts }] =
        await Promise.all([
          await feedlyClient.GET('/subscriptions'),
          await feedlyClient.GET('/markers/counts'),
        ]);

      subscriptionStore.dispatch({
        type: 'receiveSubscriptions',
        subscriptions: subscriptions!,
        unreadCounts: unreadCounts!.unreadCounts,
      });
    } catch (e) {
      subscriptionStore.dispatch({
        type: 'failSubscriptions',
      });
      throw e;
    }
  };
}

export function subscribeToFeed(
  feed: Feed,
  labels: string[],
): AsyncAction<SubscriptionContext> {
  return async ({
    authStore,
    feedlyClient,
    subscriptionStore,
    authenticator,
  }) => {
    const auth = await acquireAuth()({
      authStore,
      feedlyClient,
      authenticator,
    });

    const categories = labels.map((label) => ({
      id: `user/${auth.id}/category/${label}`,
      label,
    }));

    await feedlyClient.POST('/subscriptions', {
      body: {
        id: feed.id,
        categories,
      },
    });

    const subscription: Subscription = {
      id: feed.id,
      title: feed.title,
      categories,
      website: feed.website,
      velocity: feed.velocity,
      topics: feed.topics,
    };

    const unreadCounts = await feedlyClient.GET('/markers/counts', {
      id: feed.id,
    });
    if (unreadCounts.error !== undefined) {
      throw unreadCounts.error;
    }

    subscriptionStore.dispatch({
      type: 'addSubscription',
      subscription,
      unreadCount: unreadCounts.data.unreadCounts[0] ?? {
        id: feed.id,
        count: 0,
        updated: Date.now(),
      },
    });
  };
}

export function unsubscribeFromFeed(
  feed: Feed,
): AsyncAction<SubscriptionContext> {
  return async ({ feedlyClient, subscriptionStore }) => {
    await feedlyClient.DELETE('/subscriptions/{feedId}', {
      params: {
        path: {
          feedId: feed.id,
        },
      },
    });

    subscriptionStore.dispatch({
      type: 'removeSubscription',
      id: feed.id,
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
