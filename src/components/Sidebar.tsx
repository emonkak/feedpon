import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';
import { Link } from 'react-router';
import { createSelector } from 'reselect';

import ConfirmModal from 'components/parts/ConfirmModal';
import Dropdown from 'components/parts/Dropdown';
import FeedSearchForm from 'components/parts/FeedSearchForm';
import Portal from 'components/parts/Portal';
import RelativeTime from 'components/parts/RelativeTime';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import createAscendingComparer from 'utils/createAscendingComparer';
import createDescendingComparer from 'utils/createDescendingComparer';
import { Category, Profile, State, Subscription, SubscriptionsOrder } from 'messaging/types';
import { MenuItem } from 'components/parts/Menu';
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
    theme: boolean;
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

    handleOrganizeSubscriptions() {
        const { router } = this.props;

        router.push('/categories/');
    }

    handleSearch(query: string) {
        const { router } = this.props;

        router.push('/search/' + encodeURIComponent(query));
    }

    handleSelect(path: string) {
        const { router } = this.props;

        router.push(path);
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
                            value="/streams/all"
                            primaryText="All"
                            secondaryText={Number(totalUnreadCount).toLocaleString()} />
                        <TreeLeaf
                            value="/streams/pins?onlyUnread=0"
                            primaryText="Pins" />
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
                    <ProfileDropdown
                        isLoading={userIsLoading}
                        profile={profile}
                        onRefresh={onFetchUser}
                        onLogout={onRevokeToken} />
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
                            <i className="icon icon-16 icon-menu-2" />
                        </button>
                    }>
                    <div className="menu-heading">Order</div>
                    <MenuItem
                        icon={order === 'title' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        onSelect={onChangeSubscriptionsOrder}
                        primaryText="Title"
                        value="title" />
                    <MenuItem
                        icon={order === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        onSelect={onChangeSubscriptionsOrder}
                        primaryText="Newest first"
                        value="newest" />
                    <MenuItem
                        icon={order === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        onSelect={onChangeSubscriptionsOrder}
                        primaryText="Oldest first"
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

interface ProfileDropdownProps {
    isLoading: boolean;
    onLogout: () => void;
    onRefresh: () => void;
    profile: Profile;
}

interface ProfileDropdownState {
    logoutModalIsOpened: boolean;
}

class ProfileDropdown extends PureComponent<ProfileDropdownProps, ProfileDropdownState> {
    constructor(props: ProfileDropdownProps, context: any) {
        super(props, context);

        this.state = {
            logoutModalIsOpened: false
        };

        this.handleCloseLogoutModal = this.handleCloseLogoutModal.bind(this);
        this.handleOpenLogoutModal = this.handleOpenLogoutModal.bind(this);
    }

    handleCloseLogoutModal() {
        this.setState({
            logoutModalIsOpened: false
        });
    }

    handleOpenLogoutModal() {
        this.setState({
            logoutModalIsOpened: true
        });
    }

    render() {
        const { isLoading, onLogout, onRefresh, profile } = this.props;
        const { logoutModalIsOpened } = this.state;

        const icon = profile.picture
            ? <img className="u-flex-shrink-0 u-rounded-circle" height="40" width="40" src={profile.picture} />
            : <span className="u-flex-shrink-0"><i className="icon icon-40 icon-contacts" /></span>;

        return (
            <Portal overlay={
                <ConfirmModal
                    confirmButtonClassName="button button-negative"
                    confirmButtonLabel="Logout"
                    isOpened={logoutModalIsOpened}
                    message="Are you sure you want to logout in current user?"
                    onClose={this.handleCloseLogoutModal}
                    onConfirm={onLogout}
                    title={`Logout "${profile.userId}"`} />
            }>
                <Dropdown
                    className="dropdown-block"
                    toggleButton={
                        <button
                            className="button button-outline-default button-block"
                            disabled={isLoading}>
                            <div className="u-flex u-flex-align-items-center dropdown-arrow">
                                {icon}
                                <span className="u-flex-grow-1 u-margin-left-1 u-text-left">
                                    <div><strong>{profile.userId}</strong></div>
                                    <div className="u-text-small">via <strong>{profile.source}</strong></div>
                                </span>
                            </div>
                        </button>
                    }>
                    <MenuItem
                        onSelect={onRefresh}
                        primaryText="Refresh" />
                    <MenuItem
                        onSelect={this.handleOpenLogoutModal}
                        primaryText="Logout..." />
                </Dropdown>
            </Portal>
        );
    }
}

const titleComparer = createAscendingComparer<Subscription>('title');
const newestComparer = createDescendingComparer<Subscription>('updatedAt');
const oldestComparer = createAscendingComparer<Subscription>('updatedAt');

export default connect(() => {
    const totalUnreadCountSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (subscriptions) => subscriptions.reduce(
            (total, subscription) => total + subscription.unreadCount,
            0
        )
    );

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
            totalUnreadCount: totalUnreadCountSelector(state),
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
