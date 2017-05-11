import React, { PureComponent } from 'react';
import { History, Location } from 'history';
import { Link } from 'react-router';

import SidebarTree from 'components/parts/SidebarTree';
import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { State, Subscriptions } from 'messaging/types';
import { fetchSubscriptions } from 'messaging/subscription/actions';

interface SidebarProps {
    location: Location;
    onFetchSubscriptions: () => void;
    router: History;
    subscriptions: Subscriptions;
}

class Sidebar extends PureComponent<SidebarProps, {}> {
    constructor(props: SidebarProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
        this.handleReload = this.handleReload.bind(this);
    }

    componentWillMount() {
        const { subscriptions, onFetchSubscriptions } = this.props;

        if (subscriptions.lastUpdatedAt == null) {
            onFetchSubscriptions();
        }
    }

    handleSelect(selectedValue: string) {
        const { router } = this.props;

        router.push(selectedValue);
    }

    handleReload() {
        const { onFetchSubscriptions, subscriptions } = this.props;

        if (!subscriptions.isLoading) {
            onFetchSubscriptions();
        }
    }

    render() {
        const { location, subscriptions } = this.props;

        return (
            <nav className="sidebar">
                <div className="sidebar-group">
                    <input type="text" className="form-search-box" placeholder="Search for feeds ..." />
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

export default connect(
    (state: State) => ({
        subscriptions: state.subscriptions,
    }),
    (dispatch) => ({
        onFetchSubscriptions: bindAction(fetchSubscriptions, dispatch)
    })
)(Sidebar);
