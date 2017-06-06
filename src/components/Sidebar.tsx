import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';
import { Link } from 'react-router';
import { createSelector } from 'reselect';

import Dropdown from 'components/parts/Dropdown';
import FeedSearchForm from 'components/parts/FeedSearchForm';
import RelativeTime from 'components/parts/RelativeTime';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Menu, MenuItem } from 'components/parts/Menu';
import { Category, State, Subscription, SubscriptionOrder } from 'messaging/types';
import { Tree, TreeBranch, TreeLeaf } from 'components/parts/Tree';
import { changeSubscriptionOrder, changeUnreadViewing, fetchSubscriptions } from 'messaging/subscriptions/actions';

const UNCATEGORIZED = Symbol();

interface SidebarProps {
    categories: Category[];
    groupedSubscriptions: { [key: string]: GroupedSubscription };
    isLoading: boolean;
    lastUpdatedAt: number;
    location: Location;
    onChangeSubscriptionOrder: typeof changeSubscriptionOrder;
    onChangeUnreadViewing: typeof changeUnreadViewing;
    onFetchSubscriptions: typeof fetchSubscriptions;
    onlyUnread: boolean;
    order: SubscriptionOrder;
    router: History;
    subscriptions: Subscription[];
    totalUnreadCount: number;
}

interface GroupedSubscription {
    items: Subscription[];
    unreadCount: number;
};

class Sidebar extends PureComponent<SidebarProps, {}> {
    constructor(props: SidebarProps, context: any) {
        super(props, context);

        this.handleOrganizeSubscriptions = this.handleOrganizeSubscriptions.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillMount() {
        const { lastUpdatedAt, onFetchSubscriptions } = this.props;

        if (lastUpdatedAt === 0) {
            onFetchSubscriptions();
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
            isLoading,
            lastUpdatedAt,
            location,
            onChangeSubscriptionOrder,
            onChangeUnreadViewing,
            onFetchSubscriptions,
            onlyUnread,
            order,
            subscriptions,
            totalUnreadCount
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
                        isLoading={isLoading}
                        lastUpdatedAt={lastUpdatedAt}
                        onChangeSubscriptionOrder={onChangeSubscriptionOrder}
                        onChangeUnreadViewing={onChangeUnreadViewing}
                        onOrganizeSubscriptions={this.handleOrganizeSubscriptions}
                        onReload={onFetchSubscriptions}
                        onlyUnread={onlyUnread}
                        order={order} />
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
                <div className="sidebar-group u-text-center">
                    <ul className="list-inline list-inline-slashed">
                        <li className="list-inline-item"><a href="#">emonkak@gmail.com</a></li>
                        <li className="list-inline-item"><a href="#">Logout</a></li>
                    </ul>
                </div>
            </nav>
        );
    }
}

interface SubscriptionTreeHeaderProps {
    isLoading: boolean;
    lastUpdatedAt: number;
    onChangeSubscriptionOrder: (order: SubscriptionOrder) => void;
    onChangeUnreadViewing: (onlyUnread: boolean) => void;
    onReload: () => void;
    onOrganizeSubscriptions: () => void;
    onlyUnread: boolean;
    order: SubscriptionOrder;
}

class SubscriptionTreeHeader extends PureComponent<SubscriptionTreeHeaderProps, {}> {
    render() {
        const {
            isLoading,
            lastUpdatedAt,
            onChangeSubscriptionOrder,
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
                    pullRight={true}
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
                                onSelect={onChangeSubscriptionOrder}
                                primaryText="Title"
                                value="title" />
                            <MenuItem
                                icon={order === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                                onSelect={onChangeSubscriptionOrder}
                                primaryText="Newest First"
                                value="newest" />
                            <MenuItem
                                icon={order === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                                onSelect={onChangeSubscriptionOrder}
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

export default connect(() => {
    const visibleSubscriptionsSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (state: State) => state.subscriptions.onlyUnread,
        (subscriptions, onlyUnread) => {
            if (!onlyUnread) {
                return subscriptions;
            }
            return subscriptions.filter((subscription) => subscription.unreadCount > 0);
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
            isLoading: state.subscriptions.isLoading,
            lastUpdatedAt: state.subscriptions.lastUpdatedAt,
            onlyUnread: state.subscriptions.onlyUnread,
            order: state.subscriptions.order,
            subscriptions: state.subscriptions.items,
            totalUnreadCount: state.subscriptions.totalUnreadCount
        }),
        mapDispatchToProps: bindActions({
            onChangeSubscriptionOrder: changeSubscriptionOrder,
            onChangeUnreadViewing: changeUnreadViewing,
            onFetchSubscriptions: fetchSubscriptions
        })
    };
})(Sidebar);
