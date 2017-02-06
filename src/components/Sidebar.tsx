import * as React from 'react';
import * as classnames from 'classnames';
import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/groupBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';

import Tree from 'components/parts/Tree';
import TreeBranch from 'components/parts/TreeBranch';
import TreeHeader from 'components/parts/TreeHeader';
import TreeLeaf from 'components/parts/TreeLeaf';
import connect from 'supports/components/connect';
import { fetchSubscriptions } from 'messaging/actions';
import { replace } from 'supports/middlewares/historyActions';

const numberFormatter = new Intl.NumberFormat();

@connect()
export default class Sidebar extends React.PureComponent<any, any> {
    static propTypes = {
        subscriptions: React.PropTypes.array.isRequired,
        dispatch: React.PropTypes.func.isRequired,
    };

    componentWillMount() {
        const { dispatch } = this.props;

        dispatch(fetchSubscriptions());
    }

    handleSelect(event: any, activeKey: React.Key, activeType: React.ReactType) {
        const { dispatch } = this.props;

        dispatch(replace(activeKey as string));
    }

    renderCategory(category: any, subscriptions: any[]) {
        const totalUnreadCount = subscriptions.reduce((total, subscription) => {
            return total + subscription.unreadCount;
        }, 0);

        return (
                <TreeBranch key={`/categories/${category.categoryId}`}
                            className={classnames({ 'is-important': totalUnreadCount > 0 })}
                            primaryText={category.name}
                            secondaryText={totalUnreadCount > 0 ? numberFormatter.format(totalUnreadCount) : null}
                            icon={<i className="icon icon-16 icon-angle-down" />}>
                {subscriptions.map(subscription => this.renderSubscription(subscription))}
            </TreeBranch>
        );
    }

    renderSubscription(subscription: any) {
        return (
            <TreeLeaf key={`/subscriptions/${subscription.subscriptionId}`}
                      className={classnames({ 'is-important': subscription.unreadCount > 0 })}
                      primaryText={subscription.title}
                      secondaryText={subscription.unreadCount > 0 ? numberFormatter.format(subscription.unreadCount) : null}
                      icon={<i className="icon icon-16 icon-file" />} />
        );
    }

    render() {
        const { subscriptions } = this.props;

        const totalUnreadCount = (subscriptions as any[]).reduce((total, subscription) => {
            return total + subscription.unreadCount;
        }, 0);

        const groupedSubscriptions = new Enumerable(subscriptions as any[])
            .groupBy(subscription => subscription.category.categoryId)
            .select(([categoryId, subscriptions]) => this.renderCategory(subscriptions[0].category, subscriptions))
            .toArray();

        return (
            <nav className="sidebar">
                <header className="sidebar-header">
                    <input type="text" className="search-box" placeholder="Search for feeds ..." />
                </header>
                <div className="sidebar-body">
                    <div className="sidebar-content">
                        <Tree onSelect={this.handleSelect.bind(this)}>
                           <TreeLeaf key="/" primaryText="Dashboard" />
                           <TreeLeaf key="/all/" primaryText="All" secondaryText={numberFormatter.format(totalUnreadCount)} />
                           <TreeLeaf key="/pins/" primaryText="Pins" secondaryText="12" />
                           <TreeHeader title="Updated 6 minutes ago"
                                       leftIcon={<i className="icon icon-16 icon-refresh" />}
                                       rightIcon={<i className="icon icon-16 icon-more" />} />
                           {groupedSubscriptions}
                           <TreeLeaf key="/settings/" primaryText="Settings" />
                           <TreeLeaf key="/about/" primaryText="About..." />
                        </Tree>
                    </div>
                    <div className="sidebar-content">
                        <button type="button" className="button button-block button-default">New Subscription</button>
                    </div>
                </div>
                <footer className="sidebar-footer">
                    <ul className="list-inline list-inline-slash">
                        <li><a href="#">emonkak@gmail.com</a></li>
                        <li><a href="#">Logout</a></li>
                    </ul>
                </footer>
            </nav>
        );
    }
}
