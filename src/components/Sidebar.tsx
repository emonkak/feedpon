import Enumerable from '@emonkak/enumerable';
import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { InjectedRouter } from 'react-router';
import { routerShape } from 'react-router/lib/PropTypes';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import RelativeTime from 'components/parts/RelativeTime';
import Tree from 'components/parts/Tree';
import TreeBranch from 'components/parts/TreeBranch';
import TreeHeader from 'components/parts/TreeHeader';
import TreeLeaf from 'components/parts/TreeLeaf';
import connect from 'supports/react/connect';
import { Category, State, Subscription } from 'messaging/types';
import { fetchSubscriptions } from 'messaging/actions';

import '@emonkak/enumerable/extensions/groupJoin';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';

interface Props {
    readonly categories?: Category[];
    readonly dispatch?: (action: any) => void;
    readonly isLoading?: boolean;
    readonly lastUpdatedAt?: string;
    readonly selectedValue?: string;
    readonly subscriptions?: Subscription[];
    readonly router?: InjectedRouter;
}

@connect((state: State) => ({
    categories: state.categories,
    subscriptions: state.subscriptions.items,
    isLoading: state.subscriptions.isLoading,
    lastUpdatedAt: state.subscriptions.lastUpdatedAt
}))
export default class Sidebar extends PureComponent<Props, {}> {
    static propTypes = {
        categories: PropTypes.array.isRequired,
        dispatch: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired,
        lastUpdatedAt: PropTypes.string,
        router: routerShape,
        selectedValue: PropTypes.string,
        subscriptions: PropTypes.array.isRequired
    };

    componentWillMount() {
        const { dispatch, lastUpdatedAt } = this.props;

        if (lastUpdatedAt == null) {
            dispatch(fetchSubscriptions());
        }
    }

    handleSelect(event: React.SyntheticEvent<any>, selectedValue: string, activeType: React.ReactType) {
        const { router } = this.props;

        router.replace(selectedValue);
    }

    handleReload(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { dispatch, isLoading } = this.props;

        if (!isLoading) {
            dispatch(fetchSubscriptions());
        }
    }

    renderCategory(category: Category, subscriptions: Subscription[]) {
        const totalUnreadCount = subscriptions.reduce((total, subscription) => {
            return total + subscription.unreadCount;
        }, 0);

        return (
                <TreeBranch key={`/feeds/${encodeURIComponent(category.feedId)}`}
                            value={`/feeds/${encodeURIComponent(category.feedId)}`}
                            className={classnames({ 'is-important': totalUnreadCount > 0 })}
                            primaryText={category.title}
                            secondaryText={totalUnreadCount > 0 ? Number(totalUnreadCount).toLocaleString() : null}
                            icon={<i className="icon icon-16 icon-angle-down" />}>
                {subscriptions.map(subscription => this.renderSubscription(subscription))}
            </TreeBranch>
        );
    }

    renderSubscription(subscription: Subscription) {
        return (
            <TreeLeaf key={`/feeds/${encodeURIComponent(subscription.feedId)}`}
                      value={`/feeds/${encodeURIComponent(subscription.feedId)}`}
                      className={classnames({ 'is-important': subscription.unreadCount > 0 })}
                      primaryText={subscription.title}
                      secondaryText={subscription.unreadCount > 0 ? Number(subscription.unreadCount).toLocaleString() : null}
                      icon={<i className="icon icon-16 icon-file" />} />
        );
    }

    renderTree() {
        const { categories, isLoading, lastUpdatedAt, selectedValue, subscriptions } = this.props;

        const totalUnreadCount = subscriptions.reduce((total, subscription) => {
            return total + subscription.unreadCount;
        }, 0);

        const groupedSubscriptions = new Enumerable(categories)
            .groupJoin(
                subscriptions,
                category => category.categoryId,
                subscription => subscription.categoryId,
                (category, subscriptions) => ({ category, subscriptions })
            )
            .select(({ category, subscriptions }) => this.renderCategory(category, subscriptions))
            .toArray();

        const lastUpdate = lastUpdatedAt
            ? <span>Updated <RelativeTime time={lastUpdatedAt} /></span>
            : 'Not updated yet';

        return (
            <Tree value={selectedValue}
                    onSelect={this.handleSelect.bind(this)}>
                <TreeLeaf key="/" value="/" primaryText="Dashboard" />
                <TreeLeaf key="/feeds/all/" value="/feeds/all/" primaryText="All" secondaryText={Number(totalUnreadCount).toLocaleString()} />
                <TreeLeaf key="/feeds/pins/" value="/feeds/pins/" primaryText="Pins" secondaryText="12" />
                <TreeHeader>
                    <a className="tree-node-icon" href="#" onClick={this.handleReload.bind(this)}>
                        <i className={classnames('icon', 'icon-16', 'icon-refresh', {
                            'animation-clockwise-rotation': isLoading
                        })} />
                    </a>
                    <span className="tree-node-label">{lastUpdate}</span>
                    <Dropdown
                        pullRight={true}
                        className="tree-node-icon"
                        toggleButton={<a className="link-default" href="#"><i className="icon icon-16 icon-more" /></a>}>
                        <div className="menu-heading">Order</div>
                        <MenuItem primaryText="Newest First" />
                        <MenuItem primaryText="Oldest First" />
                        <div className="menu-divider" />
                        <MenuItem primaryText="Unread only" />
                    </Dropdown>
                </TreeHeader>
                {groupedSubscriptions}
                <TreeLeaf key="/settings/" value="/settings/" primaryText="Settings" />
                <TreeLeaf key="/about/" value="/about/" primaryText="About..." />
            </Tree>
        );
    }

    render() {
        return (
            <nav className="sidebar">
                <div className="sidebar-group">
                    <input type="text" className="search-box" placeholder="Search for feeds ..." />
                </div>
                <div className="sidebar-group">
                    {this.renderTree()}
                </div>
                <div className="sidebar-group">
                    <button type="button" className="button button-block button-default">New Subscription</button>
                </div>
                <div className="sidebar-group u-text-center">
                    <ul className="list-inline">
                        <li className="list-inline-item"><a href="#">emonkak@gmail.com</a></li>
                        <li className="list-inline-item"><a href="#">Logout</a></li>
                    </ul>
                </div>
            </nav>
        );
    }
}
