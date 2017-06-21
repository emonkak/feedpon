import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';
import { Link } from 'react-router';
import { createSelector } from 'reselect';

import Dropdown from 'components/parts/Dropdown';
import FeedSearchForm from 'components/parts/FeedSearchForm';
import ProfileDropdown from 'components/parts/ProfileDropdown';
import RelativeTime from 'components/parts/RelativeTime';
import SubscriptionIcon from 'components/parts/SubscriptionIcon';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import createAscendingComparer from 'utils/createAscendingComparer';
import createDescendingComparer from 'utils/createDescendingComparer';
import { Category, Profile, State, Subscription, SubscriptionOrderKind } from 'messaging/types';
import { MenuItem, MenuLink } from 'components/parts/Menu';
import { Tree, TreeBranch, TreeLeaf } from 'components/parts/Tree';
import { changeSubscriptionOrder, changeUnreadViewing, fetchSubscriptions } from 'messaging/subscriptions/actions';
import { fetchUser } from 'messaging/user/actions';
import { revokeToken } from 'messaging/credential/actions';

const UNCATEGORIZED = Symbol();

interface SidebarProps {
    categories: Category[];
    groupedSubscriptions: { [key: string]: GroupedSubscription };
    lastUpdatedAt: number;
    location: Location;
    onChangeSubscriptionOrder: typeof changeSubscriptionOrder;
    onChangeUnreadViewing: typeof changeUnreadViewing;
    onFetchSubscriptions: typeof fetchSubscriptions;
    onFetchUser: typeof fetchUser;
    onRevokeToken: typeof revokeToken;
    onlyUnread: boolean;
    profile: Profile;
    router: History;
    subscriptionOrder: SubscriptionOrderKind;
    subscriptions: Subscription[];
    subscriptionsIsLoading: boolean;
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

    render() {
        const {
            categories,
            groupedSubscriptions,
            lastUpdatedAt,
            location,
            onChangeSubscriptionOrder,
            onChangeUnreadViewing,
            onFetchSubscriptions,
            onFetchUser,
            onRevokeToken,
            onlyUnread,
            profile,
            subscriptions,
            subscriptionsIsLoading,
            subscriptionOrder,
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
                    <Tree onSelect={this.handleSelect}>
                        <TreeLeaf
                            value="/"
                            primaryText="Dashboard"
                            isSelected={location.pathname === '/'} />
                        <TreeLeaf
                            value="/streams/all"
                            primaryText="All"
                            secondaryText={Number(totalUnreadCount).toLocaleString()}
                            isSelected={location.pathname.startsWith('/streams/all')} />
                        <TreeLeaf
                            value="/streams/pins?onlyUnread=0"
                            primaryText="Pins"
                            isSelected={location.pathname.startsWith('/streams/pins')} />
                    </Tree>
                </div>
                <div className="sidebar-group">
                    <SubscriptionTreeHeader
                        isLoading={subscriptionsIsLoading}
                        lastUpdatedAt={lastUpdatedAt}
                        onChangeSubscriptionOrder={onChangeSubscriptionOrder}
                        onChangeUnreadViewing={onChangeUnreadViewing}
                        onReload={onFetchSubscriptions}
                        onlyUnread={onlyUnread}
                        subscriptionOrder={subscriptionOrder} />
                    <SubscriptionTree
                        categories={categories}
                        groupedSubscriptions={groupedSubscriptions}
                        selectedPath={location.pathname}
                        onSelect={this.handleSelect} />
                </div>
                <div className="sidebar-group">
                    <Tree onSelect={this.handleSelect}>
                        <TreeLeaf
                            value="/settings/"
                            primaryText="Settings"
                            isSelected={location.pathname.startsWith('/settings/')} />
                        <TreeLeaf
                            value="/about/"
                            primaryText="About"
                            isSelected={location.pathname.startsWith('/about/')} />
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
    onChangeSubscriptionOrder: (order: SubscriptionOrderKind) => void;
    onChangeUnreadViewing: (onlyUnread: boolean) => void;
    onReload: () => void;
    onlyUnread: boolean;
    subscriptionOrder: SubscriptionOrderKind;
}

const SubscriptionTreeHeader: React.SFC<SubscriptionTreeHeaderProps> = ({
    isLoading,
    lastUpdatedAt,
    onChangeSubscriptionOrder,
    onChangeUnreadViewing,
    onReload,
    onlyUnread,
    subscriptionOrder
}) => {
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
                    icon={subscriptionOrder === 'title' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeSubscriptionOrder}
                    primaryText="Title"
                    value="title" />
                <MenuItem
                    icon={subscriptionOrder === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeSubscriptionOrder}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    icon={subscriptionOrder === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeSubscriptionOrder}
                    primaryText="Oldest first"
                    value="oldest" />
                <div className="menu-divider" />
                <MenuItem
                    icon={onlyUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeUnreadViewing}
                    primaryText="Only unread"
                    value={!onlyUnread} />
                <div className="menu-divider" />
                <MenuLink
                    to="/categories/"
                    primaryText="Organize subscriptions..." />
            </Dropdown>
        </header>
    );
}

interface SubscriptionTreeProps {
    categories: Category[];
    groupedSubscriptions: { [key: string]: GroupedSubscription };
    onSelect: (value: string) => void;
    selectedPath: string;
}

const SubscriptionTree: React.SFC<SubscriptionTreeProps> = ({
    categories,
    groupedSubscriptions,
    onSelect,
    selectedPath
}) => {
    const visibleCategories = categories
        .filter((category) => !!groupedSubscriptions[category.label])
        .map((category) => ({ category, groupedSubscription: groupedSubscriptions[category.label]! }));

    const uncategorizedSubscriptions = groupedSubscriptions[UNCATEGORIZED]
        ? groupedSubscriptions[UNCATEGORIZED].items
        : [];

    return (
        <Tree onSelect={onSelect}>
            {visibleCategories.map(({ category, groupedSubscription }) =>
                <CategoryBranch
                    key={category.categoryId}
                    selectedPath={selectedPath}
                    category={category}
                    subscriptions={groupedSubscription.items}
                    unreadCount={groupedSubscription.unreadCount} />
            )}
            {uncategorizedSubscriptions.map((subscription) => {
                const path = `/streams/${encodeURIComponent(subscription.streamId)}`;

                return (
                    <SubscriptionLeaf
                        key={subscription.subscriptionId}
                        iconUrl={subscription.iconUrl}
                        isSelected={selectedPath.startsWith(path)}
                        path={path}
                        title={subscription.title}
                        unreadCount={subscription.unreadCount} />
                );
            })}
        </Tree>
    );
}

interface CategoryBranchProps {
    category: Category;
    selectedPath: string;
    subscriptions: Subscription[];
    unreadCount: number;
}

const CategoryBranch: React.SFC<CategoryBranchProps> = ({
    category,
    unreadCount,
    selectedPath,
    subscriptions
}) => {
    const path = `/streams/${encodeURIComponent(category.streamId)}`;

    return (
        <TreeBranch
            value={path}
            isSelected={selectedPath.startsWith(path)}
            className={classnames({ 'is-important': unreadCount > 0 })}
            primaryText={category.label}
            secondaryText={unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''}>
            {subscriptions.map((subscription) => {
                const path =`/streams/${encodeURIComponent(subscription.streamId)}`;

                return (
                    <SubscriptionLeaf
                        key={subscription.subscriptionId}
                        iconUrl={subscription.iconUrl}
                        isSelected={selectedPath.startsWith(path)}
                        path={path}
                        title={subscription.title}
                        unreadCount={subscription.unreadCount} />
                );
            })}
        </TreeBranch>
    );
};

interface SubscriptionLeafProps {
    iconUrl: string;
    isSelected: boolean;
    path: string;
    title: string;
    unreadCount: number;
}

const SubscriptionLeaf: React.SFC<SubscriptionLeafProps> = ({
    iconUrl,
    isSelected,
    path,
    title,
    unreadCount,
}) => {
    return (
        <TreeLeaf
            value={path}
            isSelected={isSelected}
            className={classnames({ 'is-important': unreadCount > 0 })}
            primaryText={title}
            secondaryText={unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''}
            icon={<SubscriptionIcon title={title} iconUrl={iconUrl} />} />
    );
};

const categoriesComparer = createAscendingComparer<Category>('categoryId');

const subscriptionTitleComparer = createAscendingComparer<Subscription>('title');
const subscriptionNewestComparer = createDescendingComparer<Subscription>('updatedAt');
const subscriptionOldestComparer = createAscendingComparer<Subscription>('updatedAt');

export default connect(() => {
    const categoriesSelector = createSelector(
        (state: State) => state.categories.items,
        (categories) => Object.values(categories).sort(categoriesComparer)
    );

    const subscriptionsSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (subscriptions) => Object.values(subscriptions)
    );

    const totalUnreadCountSelector = createSelector(
        subscriptionsSelector,
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
                    return subscriptionTitleComparer;

                case 'newest':
                    return subscriptionNewestComparer;

                case 'oldest':
                    return subscriptionOldestComparer;
            }
        }
    );

    const visibleSubscriptionsSelector = createSelector(
        subscriptionsSelector,
        (state: State) => state.subscriptions.onlyUnread,
        subscriptionComparerSelector,
        (subscriptions, onlyUnread, subscriptionComparer) => {
            if (onlyUnread) {
                return subscriptions
                    .filter((subscription) => subscription.unreadCount > 0)
                    .sort(subscriptionComparer);
            }
            return subscriptions
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
            categories: categoriesSelector(state),
            groupedSubscriptions: groupedSubscriptionsSelector(state),
            lastUpdatedAt: state.subscriptions.lastUpdatedAt,
            onlyUnread: state.subscriptions.onlyUnread,
            profile: state.user.profile,
            subscriptions: subscriptionsSelector(state),
            subscriptionsIsLoading: state.subscriptions.isLoading,
            subscriptionOrder: state.subscriptions.order,
            totalUnreadCount: totalUnreadCountSelector(state),
            userIsLoaded: state.user.isLoaded,
            userIsLoading: state.user.isLoading
        }),
        mapDispatchToProps: bindActions({
            onChangeSubscriptionOrder: changeSubscriptionOrder,
            onChangeUnreadViewing: changeUnreadViewing,
            onFetchSubscriptions: fetchSubscriptions,
            onFetchUser: fetchUser,
            onRevokeToken: revokeToken
        })
    };
})(Sidebar);
