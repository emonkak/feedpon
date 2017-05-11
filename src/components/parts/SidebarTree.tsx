import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import RelativeTime from 'components/parts/RelativeTime';
import { Category, Subscription, Subscriptions } from 'messaging/types';
import { TreeBranch, TreeHeader, TreeLeaf, TreeRoot } from 'components/parts/Tree';

interface SidebarTreeProps {
    onReload: () => void;
    onSelect: (value: string) => void;
    selectedValue?: string;
    subscriptions: Subscriptions;
}

export default class SidebarTree extends PureComponent<SidebarTreeProps, {}> {
    renderCategory(category: Category, subscriptions: Subscription[]) {
        return (
                <TreeBranch key={category.categoryId}
                            value={`/streams/${encodeURIComponent(category.streamId)}`}
                            className={classnames({ 'is-important': category.unreadCount > 0 })}
                            primaryText={category.label}
                            secondaryText={category.unreadCount > 0 ? Number(category.unreadCount).toLocaleString() : ''}>
                {subscriptions.map(this.renderSubscription.bind(this))}
            </TreeBranch>
        );
    }

    renderSubscription(subscription: Subscription) {
        const icon = subscription.iconUrl
            ? <img alt={subscription.title} src={subscription.iconUrl} width={16} height={16} />
            : <i className="icon icon-16 icon-file" />;

        return (
            <TreeLeaf key={subscription.subscriptionId}
                      value={`/streams/${encodeURIComponent(subscription.streamId)}`}
                      className={classnames({ 'is-important': subscription.unreadCount > 0 })}
                      primaryText={subscription.title}
                      secondaryText={subscription.unreadCount > 0 ? Number(subscription.unreadCount).toLocaleString() : ''}
                      icon={icon} />
        );
    }

    render() {
        const { onReload, onSelect, subscriptions } = this.props;

        const lastUpdate = subscriptions.lastUpdatedAt
            ? <span>Updated <RelativeTime time={subscriptions.lastUpdatedAt} /></span>
            : 'Not updated yet';

        const totalUnreadCount = subscriptions.categories.reduce(
            (total, category) => total + category.unreadCount,
            0
        );

        const groupedSubscriptions: { [key: string]: Subscription[] } =
            subscriptions.items.reduce((group: { [key: string]: Subscription[] }, subscription: Subscription) => {
                for (const categoryId of subscription.categoryIds) {
                    if (group[categoryId]) {
                        group[categoryId].push(subscription);
                    } else {
                        group[categoryId] = [subscription];
                    }
                }
                return group;
            }, {});

        const categoryNodes = subscriptions.categories.map((category) => this.renderCategory(
            category,
            groupedSubscriptions[category.categoryId] || []
        ));

        return (
            <TreeRoot selectedValue={location.pathname}
                      onSelect={onSelect}>
                <TreeLeaf value="/" primaryText="Dashboard" />
                <TreeLeaf value="/streams/all/"
                          primaryText="All"
                          secondaryText={Number(totalUnreadCount).toLocaleString()} />
                <TreeLeaf value="/streams/pins/" primaryText="Pins" />
                <TreeHeader>
                    <button className="tree-node-icon"
                            disabled={subscriptions.isLoading}
                            onClick={onReload}>
                        <i className={classnames('icon', 'icon-16', 'icon-refresh', {
                            'animation-clockwise-rotation': subscriptions.isLoading
                        })} />
                    </button>
                    <span className="tree-node-label">{lastUpdate}</span>
                    <Dropdown pullRight={true}
                              className="tree-node-icon"
                              toggleButton={<button><i className="icon icon-16 icon-more" /></button>}>
                        <div className="menu-heading">Order</div>
                        <MenuItem primaryText="Newest First" />
                        <MenuItem primaryText="Oldest First" />
                        <div className="menu-divider" />
                        <MenuItem primaryText="Unread only" />
                    </Dropdown>
                </TreeHeader>
                {categoryNodes}
                <TreeLeaf value="/settings/" primaryText="Settings" />
                <TreeLeaf value="/about/" primaryText="About..." />
            </TreeRoot>
        );
    }
}
