import React, { PureComponent } from 'react';
import { History, Location } from 'history';
import { Link } from 'react-router';

import FeedSearchForm from 'components/parts/FeedSearchForm';
import SidebarTree from 'components/parts/SidebarTree';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, Subscriptions } from 'messaging/types';
import { changeSubscriptionOrder, changeUnreadViewing, fetchSubscriptions } from 'messaging/subscriptions/actions';

interface SidebarProps {
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

        this.handleReload = this.handleReload.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillMount() {
        const { subscriptions, onFetchSubscriptions } = this.props;

        if (subscriptions.lastUpdatedAt === 0) {
            onFetchSubscriptions();
        }
    }

    handleReload() {
        const { onFetchSubscriptions, subscriptions } = this.props;

        if (!subscriptions.isLoading) {
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

    render() {
        const { location, onChangeSubscriptionOrder, onChangeUnreadViewing, subscriptions } = this.props;

        return (
            <nav className="sidebar">
                <div className="sidebar-group">
                    <FeedSearchForm onSearch={this.handleSearch}
                                    onSelect={this.handleSelect}
                                    subscriptions={subscriptions.items} />
                </div>
                <div className="sidebar-group">
                    <SidebarTree onChangeSubscriptionOrder={onChangeSubscriptionOrder}
                                 onChangeUnreadViewing={onChangeUnreadViewing}
                                 onReload={this.handleReload}
                                 onSelect={this.handleSelect}
                                 selectedValue={location.pathname}
                                 subscriptions={subscriptions} />
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

export default connect(
    (state: State) => ({
        subscriptions: state.subscriptions,
    }),
    (dispatch) => bindActions({
        onChangeSubscriptionOrder: changeSubscriptionOrder,
        onChangeUnreadViewing: changeUnreadViewing,
        onFetchSubscriptions: fetchSubscriptions
    }, dispatch)
)(Sidebar);
