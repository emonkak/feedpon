import Enumerable from '@emonkak/enumerable';
import React, { PureComponent } from 'react';
import { History, Location } from 'history';
import { Link } from 'react-router-dom';

import '@emonkak/enumerable/extensions/take';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import AutocompleteForm from '../components/AutocompleteForm';
import ProfileDropdown from '../modules/ProfileDropdown';
import SubscriptionIcon from '../modules/SubscriptionIcon';
import SubscriptionTree from '../modules/SubscriptionTree';
import SubscriptionTreeHeader from '../modules/SubscriptionTreeHeader';
import bindActions from 'feedpon-utils/flux/bindActions';
import connect from 'feedpon-utils/flux/react/connect';
import { ALL_STREAM_ID, PINS_STREAM_ID } from 'feedpon-messaging/streams';
import type { Category, GroupedSubscription, Profile, State, Subscription, SubscriptionOrderKind } from 'feedpon-messaging';
import { MenuItem } from '../components/Menu';
import { Tree, TreeLeaf } from '../components/Tree';
import { changeSubscriptionOrder, changeUnreadViewing, createAllSubscriptionsSelector, createGroupedSubscriptionsSelector, createTotalUnreadCountSelector, createVisibleSubscriptionsSelector, fetchSubscriptions } from 'feedpon-messaging/subscriptions';
import { createSortedCategoriesSelector } from 'feedpon-messaging/categories';
import { fetchUser } from 'feedpon-messaging/user';
import { logout } from 'feedpon-messaging/backend';

interface SidebarProps {
    categories: Category[];
    groupedSubscriptions: { [key: string]: GroupedSubscription };
    history: History;
    lastUpdatedAt: number;
    location: Location;
    onChangeSubscriptionOrder: typeof changeSubscriptionOrder;
    onChangeUnreadViewing: typeof changeUnreadViewing;
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
        const { lastUpdatedAt, onFetchSubscriptions, onFetchUser, userIsLoaded } = this.props;

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
            onChangeUnreadViewing,
            onFetchSubscriptions,
            onFetchUser,
            onLogout,
            onlyUnread,
            profile,
            subscriptionOrder,
            subscriptions,
            subscriptionsIsLoading,
            totalUnreadCount,
            userIsLoading
        } = this.props;

        return (
            <nav className="sidebar">
                <div className="sidebar-group">
                    <AutocompleteForm
                        items={subscriptions}
                        onSubmit={this._handleSearch}
                        onSelect={this._handleSelect}
                        renderInput={renderSearchFeedInput}
                        renderCandidates={renderSubscriptionCandidates} />
                </div>
                <div className="sidebar-group">
                    <Tree>
                        <TreeLeaf
                            value="/"
                            primaryText="Dashboard"
                            isSelected={location.pathname === '/'}
                            onSelect={this._handleSelect} />
                        <TreeLeaf
                            value={`/streams/${ALL_STREAM_ID}`}
                            primaryText="All"
                            secondaryText={Number(totalUnreadCount).toLocaleString()}
                            isSelected={location.pathname.startsWith('/streams/' + ALL_STREAM_ID)}
                            onSelect={this._handleSelect} />
                        <TreeLeaf
                            value={`/streams/${PINS_STREAM_ID}`}
                            primaryText="Pins"
                            isSelected={location.pathname.startsWith('/streams/' + PINS_STREAM_ID)}
                            onSelect={this._handleSelect} />
                    </Tree>
                </div>
                <div className="sidebar-group">
                    <SubscriptionTreeHeader
                        isLoading={subscriptionsIsLoading}
                        lastUpdatedAt={lastUpdatedAt}
                        onChangeSubscriptionOrder={onChangeSubscriptionOrder}
                        onChangeUnreadViewing={onChangeUnreadViewing}
                        onOrganizeSubscriptions={this._handleOrganizeSubscriptions}
                        onReload={onFetchSubscriptions}
                        onlyUnread={onlyUnread}
                        subscriptionOrder={subscriptionOrder} />
                    <SubscriptionTree
                        categories={categories}
                        groupedSubscriptions={groupedSubscriptions}
                        selectedPath={location.pathname}
                        onSelect={this._handleSelect} />
                </div>
                <div className="sidebar-group">
                    <Tree>
                        <TreeLeaf
                            value="/settings/ui"
                            primaryText="Settings"
                            isSelected={location.pathname.startsWith('/settings/')}
                            onSelect={this._handleSelect} />
                        <TreeLeaf
                            value="/about/"
                            primaryText="About"
                            isSelected={location.pathname.startsWith('/about/')}
                            onSelect={this._handleSelect} />
                    </Tree>
                </div>
                <div className="sidebar-group">
                    <Link
                        className="button button-block button-outline-default"
                        to="/search/">
                        New Subscription
                    </Link>
                </div>
                <div className="sidebar-group">
                    <ProfileDropdown
                        isLoading={userIsLoading}
                        profile={profile}
                        onRefresh={onFetchUser}
                        onLogout={onLogout} />
                </div>
            </nav>
        );
    }

    private _handleSearch = (query: string) => {
        const { history } = this.props;

        history.push('/search/' + encodeURIComponent(query));
    }

    private _handleSelect = (path: string) => {
        const { history } = this.props;

        history.push(path);
    }

    private _handleOrganizeSubscriptions = () => {
        const { history } = this.props;

        history.push('/categories/');
    }
}

function renderSubscriptionCandidates(subscriptions: Subscription[], query: string) {
    if (query.trim() === '') {
        return null;
    }

    const splittedQueries = query.trim().toLowerCase().split(/\s+/);
    const candidates = new Enumerable(subscriptions)
        .where((subscription) => {
            const text = (subscription.title + ' ' + subscription.url).toLowerCase();
            return splittedQueries.every((query) => text.includes(query));
        })
        .take(10)
        .select((subscription) => (
            <MenuItem
                key={subscription.subscriptionId}
                value={'/streams/' + encodeURIComponent(subscription.streamId)}
                primaryText={subscription.title}
                secondaryText={subscription.unreadCount > 0 ? Number(subscription.unreadCount).toLocaleString() : ''}
                icon={<SubscriptionIcon title={subscription.title} iconUrl={subscription.iconUrl} />} />
        ))
        .toArray();

    return <>
        {candidates}
        {candidates.length > 0 && <div className="menu-divider" />}
        <MenuItem
            value={'/search/' + encodeURIComponent(query)}
            primaryText={`Search for "${query}"`} />
    </>;
}

function renderSearchFeedInput(props: {
    onChange: React.FormEventHandler<any>,
    onKeyDown: React.KeyboardEventHandler<any>,
    onFocus: React.FocusEventHandler<any>,
    ref: (element: HTMLInputElement | null) => void
}) {
    return (
        <input
            onChange={props.onChange}
            onKeyDown={props.onKeyDown}
            onFocus={props.onFocus}
            ref={props.ref}
            type="search"
            className="input-search-box"
            placeholder="Search for feeds ..." />
    );
}

export default connect(() => {
    const categoriesSelector = createSortedCategoriesSelector();
    const allSubscriptionsSelector = createAllSubscriptionsSelector();
    const visibleSubscriptionsSelector = createVisibleSubscriptionsSelector(allSubscriptionsSelector);
    const groupedSubscriptionsSelector = createGroupedSubscriptionsSelector(visibleSubscriptionsSelector);
    const totalUnreadCountSelector = createTotalUnreadCountSelector(visibleSubscriptionsSelector);

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
            userIsLoading: state.user.isLoading
        }),
        mapDispatchToProps: bindActions({
            onChangeSubscriptionOrder: changeSubscriptionOrder,
            onChangeUnreadViewing: changeUnreadViewing,
            onFetchSubscriptions: fetchSubscriptions,
            onFetchUser: fetchUser,
            onLogout: logout
        })
    };
})(Sidebar);
