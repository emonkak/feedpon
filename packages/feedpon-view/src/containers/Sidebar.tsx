import { History, Location } from 'history';
import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/take';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type {
  Category,
  GroupedSubscription,
  Profile,
  State,
  Subscription,
  SubscriptionOrderKind,
} from 'feedpon-messaging';
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
import AutoComplete from '../components/AutoComplete';
import { MenuItem } from '../components/Menu';
import { Tree, TreeLeaf } from '../components/Tree';
import ProfileDropdown from '../modules/ProfileDropdown';
import SubscriptionIcon from '../modules/SubscriptionIcon';
import SubscriptionTree from '../modules/SubscriptionTree';
import SubscriptionTreeHeader from '../modules/SubscriptionTreeHeader';

interface SidebarProps {
  categories: Category[];
  groupedSubscriptions: { [key: string]: GroupedSubscription };
  history: History;
  lastUpdatedAt: number;
  location: Location;
  onChangeSubscriptionOrder: typeof changeSubscriptionOrder;
  onChangeOnlyUnread: typeof changeOnlyUnread;
  onFetchSubscriptions: typeof fetchSubscriptions;
  onFetchUser: typeof fetchUser;
  onLogout: typeof logout;
  onlyUnread: boolean;
  profile: Profile;
  subscriptionOrder: SubscriptionOrderKind;
  subscriptions: Subscription[];
  subscriptionsIsLoading: boolean;
  theme: boolean;
  totalUnreadCount: number;
  userIsLoaded: boolean;
  userIsLoading: boolean;
}

class Sidebar extends PureComponent<SidebarProps> {
  override componentDidMount() {
    const { lastUpdatedAt, onFetchSubscriptions, onFetchUser, userIsLoaded } =
      this.props;

    if (lastUpdatedAt === 0) {
      onFetchSubscriptions();
    }

    if (!userIsLoaded) {
      onFetchUser();
    }
  }

  override render() {
    const {
      categories,
      groupedSubscriptions,
      lastUpdatedAt,
      location,
      onChangeSubscriptionOrder,
      onChangeOnlyUnread: onChangeUnreadViewing,
      onFetchSubscriptions,
      onFetchUser,
      onLogout,
      onlyUnread,
      profile,
      subscriptionOrder,
      subscriptions,
      subscriptionsIsLoading,
      totalUnreadCount,
      userIsLoading,
    } = this.props;

    return (
      <nav className="sidebar">
        <div className="sidebar-group">
          <AutoComplete<Subscription, string>
            items={subscriptions}
            onSelect={this._handleSelect}
            onSubmit={this._handleSearch}
            placeholder="Search for feeds ..."
            renderItems={renderItems}
          ></AutoComplete>
        </div>
        <div className="sidebar-group">
          <Tree selectedValue={location.pathname} onSelect={this._handleSelect}>
            <TreeLeaf value="/" primaryText="Dashboard" />
            <TreeLeaf
              value={`/streams/${ALL_STREAM_ID}`}
              primaryText="All"
              secondaryText={Number(totalUnreadCount).toLocaleString()}
            />
            <TreeLeaf value={`/streams/${PINS_STREAM_ID}`} primaryText="Pins" />
          </Tree>
        </div>
        <div className="sidebar-group">
          <SubscriptionTreeHeader
            isLoading={subscriptionsIsLoading}
            lastUpdatedAt={lastUpdatedAt}
            onChangeSubscriptionOrder={onChangeSubscriptionOrder}
            onChangeOnlyUnread={onChangeUnreadViewing}
            onManageSubscriptions={this._handleManageSubscriptions}
            onReload={onFetchSubscriptions}
            onlyUnread={onlyUnread}
            subscriptionOrder={subscriptionOrder}
          />
          <SubscriptionTree
            categories={categories}
            groupedSubscriptions={groupedSubscriptions}
            selectedPath={location.pathname}
            onSelect={this._handleSelect}
          />
        </div>
        <div className="sidebar-group">
          <Tree selectedValue={location.pathname} onSelect={this._handleSelect}>
            <TreeLeaf value="/settings/ui" primaryText="Settings" />
            <TreeLeaf value="/about/" primaryText="About" />
          </Tree>
        </div>
        <div className="sidebar-group">
          <Link
            className="button button-block button-outline-default"
            to="/search/"
          >
            New Subscription
          </Link>
        </div>
        <div className="sidebar-group">
          <ProfileDropdown
            isLoading={userIsLoading}
            profile={profile}
            onRefresh={onFetchUser}
            onLogout={onLogout}
          />
        </div>
      </nav>
    );
  }

  private _handleSearch = (query: string) => {
    const { history } = this.props;

    history.push('/search/' + encodeURIComponent(query));
  };

  private _handleSelect = (path: string) => {
    const { history } = this.props;

    history.push(path);
  };

  private _handleManageSubscriptions = () => {
    const { history } = this.props;

    history.push('/categories/');
  };
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
        primaryText={`Search for "${query}"`}
      />
    </>
  );
}

function renderItem(subscription: Subscription) {
  return (
    <MenuItem
      key={subscription.subscriptionId}
      value={'/streams/' + encodeURIComponent(subscription.streamId)}
      primaryText={subscription.title}
      secondaryText={
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

export default connect(() => {
  const categoriesSelector = createSortedCategoriesSelector();
  const allSubscriptionsSelector = createAllSubscriptionsSelector();
  const visibleSubscriptionsSelector = createVisibleSubscriptionsSelector(
    allSubscriptionsSelector,
  );
  const groupedSubscriptionsSelector = createGroupedSubscriptionsSelector(
    visibleSubscriptionsSelector,
  );
  const totalUnreadCountSelector = createTotalUnreadCountSelector(
    visibleSubscriptionsSelector,
  );

  return {
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
  };
})(Sidebar);
