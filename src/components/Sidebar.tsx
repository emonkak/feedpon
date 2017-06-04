import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';
import { Link } from 'react-router';

import Dropdown from 'components/parts/Dropdown';
import FeedSearchForm from 'components/parts/FeedSearchForm';
import RelativeTime from 'components/parts/RelativeTime';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Menu, MenuItem } from 'components/parts/Menu';
import { Category, State, Subscription, SubscriptionOrder, Subscriptions } from 'messaging/types';
import { Tree, TreeBranch, TreeLeaf } from 'components/parts/Tree';
import { changeSubscriptionOrder, changeUnreadViewing, fetchSubscriptions } from 'messaging/subscriptions/actions';

const UNCATEGORIZED = Symbol();

interface SidebarProps {
    categories: Category[];
    location: Location;
    onChangeSubscriptionOrder: typeof changeSubscriptionOrder;
    onChangeUnreadViewing: typeof changeUnreadViewing;
    onFetchSubscriptions: typeof fetchSubscriptions;
    router: History;
    subscriptions: Subscriptions;
}

class Sidebar extends PureComponent<SidebarProps, {}> {
    constructor(props: SidebarProps, context: any) {
        super(props, context);

        this.handleOrganizeSubscriptions = this.handleOrganizeSubscriptions.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillMount() {
        const { subscriptions, onFetchSubscriptions } = this.props;

        if (subscriptions.lastUpdatedAt === 0) {
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
            location,
            onChangeSubscriptionOrder,
            onChangeUnreadViewing,
            onFetchSubscriptions,
            subscriptions
        } = this.props;

        return (
            <nav className="sidebar">
                <div className="sidebar-group">
                    <FeedSearchForm
                        onSearch={this.handleSearch}
                        onSelect={this.handleSelect}
                        subscriptions={subscriptions.items} />
                </div>
                <div className="sidebar-group">
                    <Tree selectedValue={location.pathname} onSelect={this.handleSelect}>
                        <TreeLeaf value="/" primaryText="Dashboard" />
                        <TreeLeaf
                            value="/streams/all/"
                            primaryText="All"
                            secondaryText={Number(subscriptions.totalUnreadCount).toLocaleString()} />
                        <TreeLeaf value="/streams/pins/" primaryText="Pins" />
                    </Tree>
                </div>
                <div className="sidebar-group">
                    <SubscriptionTreeHeader
                        isLoading={subscriptions.isLoading}
                        lastUpdatedAt={subscriptions.lastUpdatedAt}
                        onChangeSubscriptionOrder={onChangeSubscriptionOrder}
                        onChangeUnreadViewing={onChangeUnreadViewing}
                        onOrganizeSubscriptions={this.handleOrganizeSubscriptions}
                        onReload={onFetchSubscriptions}
                        onlyUnread={subscriptions.onlyUnread}
                        order={subscriptions.order} />
                    <SubscriptionTree
                        categories={categories}
                        onSelect={this.handleSelect}
                        onlyUnread={subscriptions.onlyUnread}
                        selectedValue={location.pathname}
                        subscriptions={subscriptions.items} />
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
        const { isLoading, lastUpdatedAt, onChangeSubscriptionOrder, onChangeUnreadViewing, onOrganizeSubscriptions, onReload, onlyUnread, order } = this.props;

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
                        'animation-clockwise-rotation': isLoading
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
    onlyUnread: boolean;
    selectedValue?: string;
    subscriptions: Subscription[];
}

class SubscriptionTree extends PureComponent<SubscriptionTreeProps, {}> {
    renderCategory(category: Category, subscriptions: Subscription[]) {
        const unreadCount = subscriptions
            .reduce((total, subscription) => total + subscription.unreadCount, 0);

        return (
            <TreeBranch
                key={category.categoryId}
                value={`/streams/${encodeURIComponent(category.streamId)}`}
                className={classnames({ 'is-important': unreadCount > 0 })}
                primaryText={category.label}
                secondaryText={unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''}>
                {subscriptions.map(this.renderSubscription, this)}
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
        const { categories, onSelect, onlyUnread, selectedValue, subscriptions } = this.props;

        const visibleSubscriptions = onlyUnread
            ? subscriptions.filter((subscription) => subscription.unreadCount > 0)
            : subscriptions;

        const groupedSubscriptions = visibleSubscriptions.reduce<{ [key: string]: Subscription[] }>((acc, subscription) => {
            const labels = subscription.labels.length > 0 ? subscription.labels : [UNCATEGORIZED];
            for (const label of labels) {
                if (acc[label]) {
                    acc[label].push(subscription);
                } else {
                    acc[label] = [subscription];
                }
            }
            return acc;
        }, {});

        const visibleCategories = categories
            .filter((category) => !!groupedSubscriptions[category.label])
            .map((category) => ({ category, subscriptions: groupedSubscriptions[category.label]! }));

        const uncategorizedSubscriptions = groupedSubscriptions[UNCATEGORIZED] || [];

        return (
            <Tree selectedValue={selectedValue} onSelect={onSelect}>
                {visibleCategories.map(({ category, subscriptions }) => this.renderCategory(category, subscriptions))}
                {uncategorizedSubscriptions.map(this.renderSubscription, this)}
            </Tree>
        );
    }
}

export default connect(
    (state: State) => ({
        categories: state.categories.items,
        subscriptions: state.subscriptions
    }),
    bindActions({
        onChangeSubscriptionOrder: changeSubscriptionOrder,
        onChangeUnreadViewing: changeUnreadViewing,
        onFetchSubscriptions: fetchSubscriptions
    })
)(Sidebar);
