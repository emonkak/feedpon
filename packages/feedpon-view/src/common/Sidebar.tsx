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
import React from 'react';

import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import { getStoreHook } from 'feedpon-flux/ebit';
import { ProfileDropdown } from './ProfileDropdown';
import { SubscriptionIcon } from './SubscriptionIcon';
import { SubscriptionTree } from './SubscriptionTree';
import { SubscriptionTreeHeader } from './SubscriptionTreeHeader';
import { AutoComplete } from './components/AutoComplete';
import { MenuItem } from './components/Menu';
import { Tree, TreeLeaf } from './components/Tree';
import { reactElement } from './directives/reactElement';

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
    onChangeOnlyUnread: onChangeUnreadViewing,
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
    locationActions.navigate(new RelativeURL('/categories/'));
  }, []);

  return context.html`
    <nav class="sidebar">
      <div class="sidebar-group">
        <${reactElement(
          <AutoComplete<Subscription, string>
            items={subscriptions}
            onSelect={handleSelect}
            onSubmit={handleSearch}
            placeholder="Search for feeds ..."
            renderItems={renderItems}
          />,
        )}>
      </div>
      <div class="sidebar-group">
        <${reactElement(
          <Tree
            selectedValue={locationState.url.pathname}
            onSelect={handleSelect}
          >
            <TreeLeaf value="/" primaryText="Dashboard" />
            <TreeLeaf
              value={`/streams/${ALL_STREAM_ID}`}
              primaryText="All"
              secondaryText={Number(totalUnreadCount).toLocaleString()}
            />
            <TreeLeaf value={`/streams/${PINS_STREAM_ID}`} primaryText="Pins" />
          </Tree>,
        )}>
      </div>
      <div class="sidebar-group">
        <${reactElement(
          <SubscriptionTreeHeader
            isLoading={subscriptionsIsLoading}
            lastUpdatedAt={lastUpdatedAt}
            onChangeSubscriptionOrder={onChangeSubscriptionOrder}
            onChangeOnlyUnread={onChangeUnreadViewing}
            onManageSubscriptions={handleManageSubscriptions}
            onReload={onFetchSubscriptions}
            onlyUnread={onlyUnread}
            subscriptionOrder={subscriptionOrder}
          />,
        )}>
        <${component(SubscriptionTree, {
          categories,
          groupedSubscriptions,
          selectedPath: locationState.url.pathname,
          onSelect: handleSelect,
        })}>
      </div>
      <div class="sidebar-group">
        <${reactElement(
          <Tree
            selectedValue={locationState.url.pathname}
            onSelect={handleSelect}
          >
            {' '}
            <TreeLeaf value="/settings/ui" primaryText="Settings" />
            <TreeLeaf value="/about/" primaryText="About" />
          </Tree>,
        )}>
      </div>
      <div class="sidebar-group">
        <a
          class="button button-block button-outline-default"
          href="#/search/"
        >
          New Subscription
        </a>
      </div>
      <div class="sidebar-group">
        <${reactElement(
          <ProfileDropdown
            isLoading={userIsLoading}
            profile={profile}
            onRefresh={onFetchUser}
            onLogout={onLogout}
          />,
        )}>
      </div>
    </nav>
  `;
}

function renderItems(subscriptions: Subscription[], query: string) {
  if (query.trim() === '') {
    return [];
  }

  const queryWords = query.trim().toLowerCase().split(/\s+/);
  const matchedItems = [];

  for (let i = 0, l = subscriptions.length; i < l; i++) {
    const subscription = subscriptions[i]!;
    const source = (subscription.title + ' ' + subscription.url).toLowerCase();
    if (queryWords.every((query) => source.includes(query))) {
      const item = renderItem(subscription);
      if (matchedItems.push(item) >= 10) {
        break;
      }
    }
  }

  return (
    <>
      {matchedItems}
      {matchedItems.length > 0 && <div className="menu-divider" />}
      <MenuItem
        value={'/search/' + encodeURIComponent(query)}
        label={`Search for "${query}"`}
      />
    </>
  );
}

function renderItem(subscription: Subscription) {
  return (
    <MenuItem
      key={subscription.subscriptionId}
      value={'/streams/' + encodeURIComponent(subscription.streamId)}
      label={subscription.title}
      hint={
        subscription.unreadCount > 0
          ? Number(subscription.unreadCount).toLocaleString()
          : ''
      }
      icon={
        <SubscriptionIcon
          title={subscription.title}
          iconUrl={subscription.iconUrl}
        />
      }
    />
  );
}
