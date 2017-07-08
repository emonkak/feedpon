import React, { PureComponent } from 'react';
import { History, Location } from 'history';
import { Link } from 'react-router';

import FeedSearchForm from 'components/parts/FeedSearchForm';
import ProfileDropdown from 'components/parts/ProfileDropdown';
import SubscriptionTree from 'components/parts/SubscriptionTree';
import SubscriptionTreeHeader from 'components/parts/SubscriptionTreeHeader';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Category, GroupedSubscription, Profile, State, Subscription, SubscriptionOrderKind } from 'messaging/types';
import { Tree, TreeLeaf } from 'components/widgets/Tree';
import { changeSubscriptionOrder, changeUnreadViewing, fetchSubscriptions } from 'messaging/subscriptions/actions';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { createGroupedSubscriptionsSelector, createTotalUnreadCountSelector, createVisibleSubscriptionsSelector } from 'messaging/subscriptions/selectors';
import { fetchUser } from 'messaging/user/actions';
import { revokeToken } from 'messaging/backend/actions';

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
                    <Tree>
                        <TreeLeaf
                            value="/"
                            primaryText="Dashboard"
                            isSelected={location.pathname === '/'}
                            onSelect={this.handleSelect} />
                        <TreeLeaf
                            value="/streams/all"
                            primaryText="All"
                            secondaryText={Number(totalUnreadCount).toLocaleString()}
                            isSelected={location.pathname.startsWith('/streams/all')}
                            onSelect={this.handleSelect} />
                        <TreeLeaf
                            value="/streams/pins?onlyUnread=0"
                            primaryText="Pins"
                            isSelected={location.pathname.startsWith('/streams/pins')}
                            onSelect={this.handleSelect} />
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
                    <Tree>
                        <TreeLeaf
                            value="/settings/"
                            primaryText="Settings"
                            isSelected={location.pathname.startsWith('/settings/')}
                            onSelect={this.handleSelect} />
                        <TreeLeaf
                            value="/about/"
                            primaryText="About"
                            isSelected={location.pathname.startsWith('/about/')}
                            onSelect={this.handleSelect} />
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
                        onLogout={onRevokeToken} />
                </div>
            </nav>
        );
    }
}

export default connect(() => {
    const categoriesSelector = createSortedCategoriesSelector();
    const visibleSubscriptionsSelector = createVisibleSubscriptionsSelector();
    const groupedSubscriptionsSelector = createGroupedSubscriptionsSelector(visibleSubscriptionsSelector);
    const totalUnreadCountSelector = createTotalUnreadCountSelector(visibleSubscriptionsSelector);

    return {
        mapStateToProps: (state: State) => ({
            categories: categoriesSelector(state),
            groupedSubscriptions: groupedSubscriptionsSelector(state),
            lastUpdatedAt: state.subscriptions.lastUpdatedAt,
            onlyUnread: state.subscriptions.onlyUnread,
            profile: state.user.profile,
            subscriptions: visibleSubscriptionsSelector(state),
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
