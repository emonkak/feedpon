import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';
import { Link } from 'react-router';
import { createSelector } from 'reselect';

import Dropdown from 'components/parts/Dropdown';
import FeedSearchForm from 'components/parts/FeedSearchForm';
import ProfileButton from 'components/parts/ProfileButton';
import RelativeTime from 'components/parts/RelativeTime';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import createAscendingComparer from 'utils/createAscendingComparer';
import createDescendingComparer from 'utils/createDescendingComparer';
import { Category, Profile, State, Subscription, SubscriptionsOrder } from 'messaging/types';
import { Menu, MenuItem } from 'components/parts/Menu';
import { Tree, TreeBranch, TreeLeaf } from 'components/parts/Tree';
import { changeSubscriptionsOrder, changeUnreadViewing, fetchSubscriptions } from 'messaging/subscriptions/actions';
import { fetchUser } from 'messaging/user/actions';
import { revokeToken } from 'messaging/credential/actions';

const UNCATEGORIZED = Symbol();

interface SidebarProps {
    categories: Category[];
    groupedSubscriptions: { [key: string]: GroupedSubscription };
    lastUpdatedAt: number;
    location: Location;
    onChangeSubscriptionsOrder: typeof changeSubscriptionsOrder;
    onChangeUnreadViewing: typeof changeUnreadViewing;
    onFetchSubscriptions: typeof fetchSubscriptions;
    onFetchUser: typeof fetchUser;
    onRevokeToken: typeof revokeToken;
    onlyUnread: boolean;
    profile: Profile;
    router: History;
    subscriptions: Subscription[];
    subscriptionsIsLoading: boolean;
    subscriptionsOrder: SubscriptionsOrder;
    totalUnreadCount: number;
    userIsLoaded: boolean;
    userIsLoading: boolean;
}

interface GroupedSubscription {
    items: Subscription[];
    unreadCount: number;
}

class Sidebar extends PureComponent<SidebarProps, {}> {
    constructor(props: SidebarProps, context: any) {
        super(props, context);

        this.handleOrganizeSubscriptions = this.handleOrganizeSubscriptions.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillMount() {
        const { lastUpdatedAt, onFetchSubscriptions, onFetchUser, userIsLoaded } = this.props;

        if (lastUpdatedAt === 0) {
            onFetchSubscriptions();
        }

        if (!userIsLoaded) {
            onFetchUser();
        }
    }

    handleSearch(query: string) {
        const { router } = this.props;

        router.push('/search/' + encodeURIComponent(query));
    }

    handleSelect(path: string) {
        const { router } = this.props;

        router.push(path);
    }

    handleOrganizeSubscriptions() {
        const { router } = this.props;

        router.push('/categories/');
    }

    render() {
        const {
            categories,
            groupedSubscriptions,
            lastUpdatedAt,
            location,
            onChangeSubscriptionsOrder,
            onChangeUnreadViewing,
            onFetchSubscriptions,
            onFetchUser,
            onRevokeToken,
            onlyUnread,
            profile,
            subscriptions,
            subscriptionsIsLoading,
            subscriptionsOrder,
            totalUnreadCount,
            userIsLoading
        } = this.props;

        return (
            <nav className="sidebar">
                <div className="sidebar-group">
                    <FeedSearchForm
                        onSearch={this.handleSearch}
                        onSelect={this.handleSelect}
                        subscriptions={subscriptions} />
                </div>
                <div className="sidebar-group">
                    <Tree selectedValue={location.pathname} onSelect={this.handleSelect}>
                        <TreeLeaf value="/" primaryText="Dashboard" />
                        <TreeLeaf
                            value="/streams/all/"
                            primaryText="All"
                            secondaryText={Number(totalUnreadCount).toLocaleString()} />
                        <TreeLeaf value="/streams/pins/" primaryText="Pins" />
                    </Tree>
                </div>
                <div className="sidebar-group">
                    <SubscriptionTreeHeader
                        isLoading={subscriptionsIsLoading}
                        lastUpdatedAt={lastUpdatedAt}
                        onChangeSubscriptionsOrder={onChangeSubscriptionsOrder}
                        onChangeUnreadViewing={onChangeUnreadViewing}
                        onOrganizeSubscriptions={this.handleOrganizeSubscriptions}
                        onReload={onFetchSubscriptions}
                        onlyUnread={onlyUnread}
                        order={subscriptionsOrder} />
                    <SubscriptionTree
                        categories={categories}
                        groupedSubscriptions={groupedSubscriptions}
                        onSelect={this.handleSelect}
                        selectedValue={location.pathname} />
                </div>
                <div className="sidebar-group">
                    <Tree selectedValue={location.pathname} onSelect={this.handleSelect}>
                        <TreeLeaf value="/settings/" primaryText="Settings" />
                        <TreeLeaf value="/about/" primaryText="About" />
                    </Tree>
                </div>
                <div className="sidebar-group">
                    <Link className="button button-block button-outline-default" to="/search/">New Subscription</Link>
                </div>
                <div className="sidebar-group">
                    <Dropdown
                        className="dropdown-block"
                        toggleButton={
                            <ProfileButton isLoading={userIsLoading} profile={profile} />
                        }
                        menu={
                            <Menu>
                                <MenuItem
                                    onSelect={onFetchUser}
                                    primaryText="Refresh" />
                                <MenuItem
                                    onSelect={onRevokeToken}
                                    primaryText="Logout..." />
                            </Menu>
                        } />
                </div>
            </nav>
        );
    }
}

interface SubscriptionTreeHeaderProps {
    isLoading: boolean;
    lastUpdatedAt: number;
    onChangeSubscriptionsOrder: (order: SubscriptionsOrder) => void;
    onChangeUnreadViewing: (onlyUnread: boolean) => void;
    onReload: () => void;
    onOrganizeSubscriptions: () => void;
    onlyUnread: boolean;
    order: SubscriptionsOrder;
}

class SubscriptionTreeHeader extends PureComponent<SubscriptionTreeHeaderProps, {}> {
    render() {
        const {
            isLoading,
            lastUpdatedAt,
            onChangeSubscriptionsOrder,
            onChangeUnreadViewing,
            onOrganizeSubscriptions,
            onReload,
            onlyUnread,
            order
        } = this.props;

        const lastUpdate = lastUpdatedAt > 0
            ? <span>Updated <RelativeTime time={lastUpdatedAt} /></span>
            : 'Not updated yet';

        return (
            <header className="sidebar-group-header">
                <button
                    className="u-flex-shrink-0 button-icon button-icon-32"
                    disabled={isLoading}
                    onClick={onReload}>
                    <i className={classnames('icon', 'icon-16', 'icon-refresh', {
                        'icon-rotating': isLoading
                    })} />
                </button>
                <strong className="u-flex-grow-1 u-text-small">{lastUpdate}</strong>
                <Dropdown
                    pullUp={false}
                    toggleButton={
                        <button className="u-flex-shrink-0 button-icon button-icon-32">
                            <i className="icon icon-16 icon-more" />
                        </button>
                    }
                    menu={
                        <Menu>
                            <div className="menu-heading">Order</div>
                            <MenuItem
                                icon={order === 'title' ? <i className="icon icon-16 icon-checkmark" /> : null}
                                onSelect={onChangeSubscriptionsOrder}
                                primaryText="Title"
                                value="title" />
                            <MenuItem
                                icon={order === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                                onSelect={onChangeSubscriptionsOrder}
                                primaryText="Newest First"
                                value="newest" />
                            <MenuItem
                                icon={order === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                                onSelect={onChangeSubscriptionsOrder}
                                primaryText="Oldest First"
                                value="oldest" />
                            <div className="menu-divider" />
                            <MenuItem
                                icon={onlyUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                                onSelect={onChangeUnreadViewing}
                                primaryText="Only unread"
                                value={!onlyUnread} />
                            <div className="menu-divider" />
                            <MenuItem
                                onSelect={onOrganizeSubscriptions}
                                primaryText="Organize subscriptions..." />
                        </Menu>
                    }>
                </Dropdown>
            </header>
        );
    }
}

interface SubscriptionTreeProps {
    categories: Category[];
    onSelect: (value: string) => void;
    selectedValue?: string;
    groupedSubscriptions: { [key: string]: GroupedSubscription };
}

class SubscriptionTree extends PureComponent<SubscriptionTreeProps, {}> {
    renderCategory(category: Category, groupedSubscription: GroupedSubscription) {
        return (
            <TreeBranch
                key={category.categoryId}
                value={`/streams/${encodeURIComponent(category.streamId)}`}
                className={classnames({ 'is-important': groupedSubscription.unreadCount > 0 })}
                primaryText={category.label}
                secondaryText={groupedSubscription.unreadCount > 0 ? Number(groupedSubscription.unreadCount).toLocaleString() : ''}>
                {groupedSubscription.items.map(this.renderSubscription, this)}
            </TreeBranch>
        );
    }

    renderSubscription(subscription: Subscription) {
        const icon = subscription.iconUrl
            ? <img alt={subscription.title} src={subscription.iconUrl} width={16} height={16} />
            : <i className="icon icon-16 icon-file" />;

        return (
            <TreeLeaf
                key={subscription.subscriptionId}
                value={`/streams/${encodeURIComponent(subscription.streamId)}`}
                className={classnames({ 'is-important': subscription.unreadCount > 0 })}
                primaryText={subscription.title}
                secondaryText={subscription.unreadCount > 0 ? Number(subscription.unreadCount).toLocaleString() : ''}
                icon={icon} />
        );
    }

    render() {
        const { categories, groupedSubscriptions, onSelect, selectedValue } = this.props;

        const visibleCategories = categories
            .filter((category) => !!groupedSubscriptions[category.label])
            .map((category) => ({ category, groupedSubscription: groupedSubscriptions[category.label]! }));

        const uncategorizedSubscriptions = groupedSubscriptions[UNCATEGORIZED]
            ? groupedSubscriptions[UNCATEGORIZED].items
            : [];

        return (
            <Tree selectedValue={selectedValue} onSelect={onSelect}>
                {visibleCategories.map(({ category, groupedSubscription }) => this.renderCategory(category, groupedSubscription))}
                {uncategorizedSubscriptions.map(this.renderSubscription, this)}
            </Tree>
        );
    }
}

const titleComparer = createAscendingComparer<Subscription>('title');
const newestComparer = createDescendingComparer<Subscription>('updatedAt');
const oldestComparer = createAscendingComparer<Subscription>('updatedAt');

export default connect(() => {
    const subscriptionComparerSelector = createSelector(
        (state: State) => state.subscriptions.order,
        (order) => {
            switch (order) {
                case 'title':
                    return titleComparer;

                case 'newest':
                    return newestComparer;

                case 'oldest':
                    return oldestComparer;
            }
        }
    );

    const visibleSubscriptionsSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (state: State) => state.subscriptions.onlyUnread,
        subscriptionComparerSelector,
        (subscriptions, onlyUnread, subscriptionComparer) => {
            if (!onlyUnread) {
                return subscriptions;
            }
            return subscriptions
                .filter((subscription) => subscription.unreadCount > 0)
                .sort(subscriptionComparer);
        }
    );

    const groupedSubscriptionsSelector = createSelector(
        visibleSubscriptionsSelector,
        (subscriptions) => subscriptions.reduce<{ [key: string]: GroupedSubscription }>((acc, subscription) => {
            const labels = subscription.labels.length > 0 ? subscription.labels : [UNCATEGORIZED];
            for (const label of labels) {
                if (acc[label]) {
                    acc[label].items.push(subscription);
                    acc[label].unreadCount += subscription.unreadCount;
                } else {
                    acc[label] = { items: [subscription], unreadCount: subscription.unreadCount };
                }
            }
            return acc;
        }, {})
    );

    return {
        mapStateToProps: (state: State) => ({
            categories: state.categories.items,
            groupedSubscriptions: groupedSubscriptionsSelector(state),
            lastUpdatedAt: state.subscriptions.lastUpdatedAt,
            onlyUnread: state.subscriptions.onlyUnread,
            profile: state.user.profile,
            subscriptions: state.subscriptions.items,
            subscriptionsIsLoading: state.subscriptions.isLoading,
            subscriptionsOrder: state.subscriptions.order,
            totalUnreadCount: state.subscriptions.totalUnreadCount,
            userIsLoaded: state.user.isLoaded,
            userIsLoading: state.user.isLoading
        }),
        mapDispatchToProps: bindActions({
            onChangeSubscriptionsOrder: changeSubscriptionsOrder,
            onChangeUnreadViewing: changeUnreadViewing,
            onFetchSubscriptions: fetchSubscriptions,
            onFetchUser: fetchUser,
            onRevokeToken: revokeToken
        })
    };
})(Sidebar);
