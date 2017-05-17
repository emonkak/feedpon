import Enumerable from '@emonkak/enumerable';
import React, { PureComponent } from 'react';
import { History, Location } from 'history';
import { Link } from 'react-router';

import '@emonkak/enumerable/extensions/take';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import Autocomplete from 'components/parts/Autocomplete';
import SidebarTree from 'components/parts/SidebarTree';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { MenuItem } from 'components/parts/Menu';
import { State, Subscription, Subscriptions } from 'messaging/types';
import { fetchSubscriptions } from 'messaging/subscription/actions';

interface SidebarProps {
    location: Location;
    onFetchSubscriptions: typeof fetchSubscriptions;
    router: History;
    subscriptions: Subscriptions;
}

class Sidebar extends PureComponent<SidebarProps, {}> {
    constructor(props: SidebarProps, context: any) {
        super(props, context);

        this.handleComplete = this.handleComplete.bind(this);
        this.handleReload = this.handleReload.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillMount() {
        const { subscriptions, onFetchSubscriptions } = this.props;

        if (subscriptions.lastUpdatedAt == null) {
            onFetchSubscriptions();
        }
    }

    handleComplete(query: string) {
        const { subscriptions } = this.props;

        if (!query) {
            return [];
        }

        const normalizedQuery = query.toLowerCase();

        return new Enumerable(subscriptions.items)
            .where((subscription) =>
                subscription.title.toLowerCase().includes(normalizedQuery) ||
                subscription.url.toLowerCase().includes(normalizedQuery)
            )
            .take(10)
            .toArray();
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

    handleSelect(selectedValue: string) {
        const { router } = this.props;

        router.push(selectedValue);
    }

    render() {
        const { location, subscriptions } = this.props;

        return (
            <nav className="sidebar">
                <div className="sidebar-group">
                    <Autocomplete inputControl={<input type="search" className="form-search-box" placeholder="Search for feeds ..." />}
                                  getCandidates={this.handleComplete}
                                  onSubmit={this.handleSearch}
                                  onSelect={this.handleSelect}
                                  renderCandidate={renderCandidate} />
                </div>
                <div className="sidebar-group">
                    <SidebarTree onReload={this.handleReload}
                                 onSelect={this.handleSelect}
                                 selectedValue={location.pathname}
                                 subscriptions={subscriptions} />
                </div>
                <div className="sidebar-group">
                    <Link className="button button-block button-outline-default" to="/search">New Subscription</Link>
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

function renderCandidate(subscription: Subscription, query: string) {
    const icon = subscription.iconUrl
        ? <img alt={subscription.title} src={subscription.iconUrl} width={16} height={16} />
        : <i className="icon icon-16 icon-file" />;

    return (
        <MenuItem key={subscription.subscriptionId}
                  value={'streams/' + encodeURIComponent(subscription.streamId)}
                  primaryText={subscription.title}
                  secondaryText={subscription.unreadCount > 0 ? Number(subscription.unreadCount).toLocaleString() : ''}
                  icon={icon} />
    );
}

export default connect(
    (state: State) => ({
        subscriptions: state.subscriptions,
    }),
    (dispatch) => bindActions({
        onFetchSubscriptions: fetchSubscriptions
    }, dispatch)
)(Sidebar);
