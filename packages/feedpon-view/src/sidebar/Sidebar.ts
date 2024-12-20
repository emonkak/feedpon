import { RelativeURL, currentLocation } from '@emonkak/ebit/router.js';
import { bindActions } from 'feedpon-flux';
import type { State, Subscription } from 'feedpon-messaging';
import { logout } from 'feedpon-messaging/backend';
import { createSortedCategoriesSelector } from 'feedpon-messaging/categories';
import { ALL_STREAM_ID, PINS_STREAM_ID } from 'feedpon-messaging/streams';
import {
  changeOnlyUnread,
  changeSubscriptionOrder,
  createAllSubscriptionsSelector,
  createGroupedSubscriptionsSelector,
  createTotalUnreadCountSelector,
  createVisibleSubscriptionsSelector,
  fetchSubscriptions,
} from 'feedpon-messaging/subscriptions';
import { fetchUser } from 'feedpon-messaging/user';

import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { classMap, component } from '@emonkak/ebit/directives.js';
import { getStoreHook } from 'feedpon-flux/ebit';
import { RelativeTime } from '../common/components/RelativeTime';
import { AutoComplete } from '../primitives/AutoComplete';
import type { MenuPrimitive } from '../primitives/Menu';
import { ProfileDropdown } from './ProfileDropdown';
import { SubscriptionDisplayDropdown } from './SubscriptionDisplayDropdown';
import { SubscriptionTree } from './SubscriptionTree';

export interface SidebarProps {}

export function Sidebar(
  {}: SidebarProps,
  context: RenderContext,
): TemplateResult {
  const [locationState, locationActions] = context.use(currentLocation);

  const categoriesSelector = context.useMemo(
    createSortedCategoriesSelector,
    [],
  );
  const allSubscriptionsSelector = context.useMemo(
    createAllSubscriptionsSelector,
    [],
  );
  const visibleSubscriptionsSelector = context.useMemo(
    () => createVisibleSubscriptionsSelector(allSubscriptionsSelector),
    [],
  );
  const groupedSubscriptionsSelector = context.useMemo(
    () => createGroupedSubscriptionsSelector(visibleSubscriptionsSelector),
    [],
  );
  const totalUnreadCountSelector = context.useMemo(
    () => createTotalUnreadCountSelector(visibleSubscriptionsSelector),
    [],
  );
  const {
    categories,
    groupedSubscriptions,
    lastUpdatedAt,
    onChangeOnlyUnread,
    onChangeSubscriptionOrder,
    onFetchSubscriptions,
    onFetchUser,
    onLogout,
    onlyUnread,
    profile,
    subscriptionOrder,
    subscriptions,
    subscriptionsIsLoading,
    totalUnreadCount,
    userIsLoaded,
    userIsLoading,
  } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        categories: categoriesSelector(state),
        groupedSubscriptions: groupedSubscriptionsSelector(state),
        lastUpdatedAt: state.subscriptions.lastUpdatedAt,
        onlyUnread: state.subscriptions.onlyUnread,
        profile: state.user.profile,
        subscriptions: allSubscriptionsSelector(state),
        subscriptionsIsLoading: state.subscriptions.isLoading,
        subscriptionOrder: state.subscriptions.order,
        totalUnreadCount: totalUnreadCountSelector(state),
        userIsLoaded: state.user.isLoaded,
        userIsLoading: state.user.isLoading,
      }),
      mapDispatchToProps: bindActions({
        onChangeSubscriptionOrder: changeSubscriptionOrder,
        onChangeOnlyUnread: changeOnlyUnread,
        onFetchSubscriptions: fetchSubscriptions,
        onFetchUser: fetchUser,
        onLogout: logout,
      }),
    }),
  );

  context.useEffect(() => {
    if (lastUpdatedAt === 0) {
      onFetchSubscriptions();
    }
  }, [lastUpdatedAt]);

  context.useEffect(() => {
    if (!userIsLoaded) {
      onFetchUser();
    }
  }, [userIsLoaded]);

  const handleSearch = context.useCallback((query: string) => {
    locationActions.navigate(
      new RelativeURL('/search/' + encodeURIComponent(query)),
    );
  }, []);

  const handleSelect = context.useCallback((path: string) => {
    locationActions.navigate(new RelativeURL(path));
  }, []);

  const handleManageSubscriptions = context.useCallback(() => {
    locationActions.navigate(new RelativeURL('/categories'));
  }, []);

  // biome-ignore format:
  const lastUpdate = lastUpdatedAt > 0 ? context.html`
    <span>
      Updated <${component(RelativeTime, {time: lastUpdatedAt}) }>
    </span>
  ` : context.html`Not updated yet`;

  return context.html`
    <nav class="Sidebar">
      <div class="SidebarSection">
        <${component(AutoComplete<Subscription>, {
          items: subscriptions,
          onSubmit: handleSearch,
          placeholder: 'Search for feeds ...',
          getFilteredItems,
        })}>
      </div>
      <div class="SidebarSection">
        <a
          class=${classMap({
            SidebarItem: true,
            'is-selected': locationState.url.pathname === '/',
          })}
          href='#/'
        >
          <span class="SidebarItem-label">Dashboard</span>
        </a>
        <a
          class=${classMap({
            SidebarItem: true,
            'is-selected':
              locationState.url.pathname === `/streams/${ALL_STREAM_ID}`,
          })}
          href=${`#/streams/${ALL_STREAM_ID}`}
        >
          <span class="SidebarItem-label">All</span>
          <span class="SidebarItem-unread">${totalUnreadCount}</span>
        </a>
        <a
          class=${classMap({
            SidebarItem: true,
            'is-selected':
              locationState.url.pathname === `/streams/${PINS_STREAM_ID}`,
          })}
          href=${`#/streams/${PINS_STREAM_ID}`}
        >
          <span class="SidebarItem-label">Pins</span>
        </a>
      </div>
      <div class="SidebarSection">
        <header class="SidebarHeader">
          <button
            aria-label="Reload subscriptions"
            class="link-soft u-flex-shrink-0"
            disabled=${subscriptionsIsLoading}
            type="button"
            @click=${onFetchSubscriptions}
          >
            <i
              aria-hidden="true"
              class=${classMap({
                icon: true,
                'icon-16': true,
                'icon-width-32': true,
                'icon-refresh': true,
                'animation-rotating': subscriptionsIsLoading,
              })}
              role="img"
            ></i>
          </button>
          <strong class="u-flex-grow-1 u-text-7"><${lastUpdate}></strong>
          <${component(SubscriptionDisplayDropdown, {
            isLoading: subscriptionsIsLoading,
            onChangeSubscriptionOrder,
            onChangeOnlyUnread,
            onManageSubscriptions: handleManageSubscriptions,
            onlyUnread,
            subscriptionOrder,
          })}>
        </header>
        <${component(SubscriptionTree, {
          categories,
          groupedSubscriptions,
          selectedPath: locationState.url.pathname,
          onSelect: handleSelect,
        })}>
      </div>
      <div class="SidebarSection">
        <a
          class=${classMap({
            SidebarItem: true,
            'is-selected': locationState.url.pathname === '/settings/ui',
          })}
          href="#/settings/ui"
        >
          <span class="SidebarItem-label">Settings</span>
        </a>
        <a
          class=${classMap({
            SidebarItem: true,
            'is-selected': locationState.url.pathname === '/about',
          })}
          href="#/about"
        >
          <span class="SidebarItem-label">About</span>
        </a>
      </div>
      <div class="SidebarSection">
        <a
          class="button button-block button-outline-default"
          href="#/search/"
        >
          New Subscription
        </a>
      </div>
      <div class="SidebarSection">
        <${component(ProfileDropdown, {
          isLoading: userIsLoading,
          profile,
          onRefresh: onFetchUser,
          onLogout,
        })}>
      </div>
    </nav>
  `;
}

function getFilteredItems(
  subscriptions: Subscription[],
  query: string,
  context: RenderContext,
): MenuPrimitive[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === '') {
    return [];
  }

  const queryWords = query.trim().toLowerCase().split(/\s+/);
  const menuItems = filterNth(
    subscriptions,
    (subscription) =>
      queryWords.every(
        (queryWord) =>
          subscription.title.toLowerCase().includes(queryWord) ||
          subscription.url.toLowerCase().includes(queryWord),
      ),
    10,
  ).map((subscription) => {
    // biome-ignore format:
    const icon = subscription.iconUrl !== '' ? context.html`
      <img
        class="u-vertical-middle u-object-fit-cover"
        alt=${subscription.title}
        src=${subscription.iconUrl}
        width="16"
        height="16"
      >
    ` : context.html`<i class="icon icon-16 icon-file "></i>`;

    return {
      type: 'link',
      key: 'subscription:' + subscription.subscriptionId,
      children: context.html`
        <div class="MenuItem-icon"><${icon}></div>
        <div class="MenuItem-content">${subscription.title}</div>
      `,
      href: '#/streams/' + encodeURIComponent(subscription.streamId),
    } as MenuPrimitive;
  });

  if (menuItems.length > 0) {
    menuItems.push(
      {
        type: 'separator',
        key: 'separator1',
      },
      {
        type: 'link',
        key: 'search_by_query',
        href: '#/search/' + encodeURIComponent(query),
        children: context.html`
          <div class="MenuItem-content">Search for "${query}"...</div>
        `,
      },
    );
  }

  return menuItems;
}

function filterNth<T>(
  elements: T[],
  predicate: (element: T) => boolean,
  n: number,
): T[] {
  const results = [];
  for (let i = 0, l = elements.length; i < l; i++) {
    const element = elements[i]!;
    if (predicate(element)) {
      if (results.push(element) >= n) {
        break;
      }
    }
  }
  return results;
}
