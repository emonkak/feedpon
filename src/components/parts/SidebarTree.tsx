import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Dropdown from 'components/parts/Dropdown';
import RelativeTime from 'components/parts/RelativeTime';
import { Category, Subscription, Subscriptions } from 'messaging/types';
import { MenuItem } from 'components/parts/Menu';
import { TreeBranch, TreeHeader, TreeLeaf, TreeRoot } from 'components/parts/Tree';

interface SidebarTreeProps {
    onReload: () => void;
    onSelect: (value: string) => void;
    selectedValue?: string;
    subscriptions: Subscriptions;
}

const UNCATEGORIZED = Symbol();

export default class SidebarTree extends PureComponent<SidebarTreeProps, {}> {
    renderCategory(category: Category, subscriptions: Subscription[]) {
        const children = [];
        let unreadCount = 0;

        for (const subscription of subscriptions) {
            children.push(this.renderSubscription(subscription));
            unreadCount += subscription.unreadCount;
        }

        return (
                <TreeBranch key={category.categoryId}
                            value={`/streams/${encodeURIComponent(category.streamId)}`}
                            className={classnames({ 'is-important': unreadCount > 0 })}
                            primaryText={category.label}
                            secondaryText={unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''}>
                {children}
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
        const { onReload, onSelect, selectedValue, subscriptions } = this.props;

        const lastUpdate = subscriptions.lastUpdatedAt
            ? <span>Updated <RelativeTime time={subscriptions.lastUpdatedAt} /></span>
            : 'Not updated yet';

        const groupedSubscriptions = subscriptions.items
            .reduce<{ [key: string]: Subscription[] }>((group, subscription) => {
                const labels = subscription.labels.length > 0
                    ? subscription.labels
                    : [UNCATEGORIZED];

                for (const label of labels) {
                    if (group[label]) {
                        group[label].push(subscription);
                    } else {
                        group[label] = [subscription];
                    }
                }
                return group;
            }, {});

        const userCategories = subscriptions.categories
            .filter((category) => !!groupedSubscriptions[category.label])
            .map((category) => this.renderCategory(
                category,
                groupedSubscriptions[category.label]
            ));
        const uncategorizedSubscriptions = (groupedSubscriptions[UNCATEGORIZED] || [])
            .map(this.renderSubscription.bind(this));

        return (
            <TreeRoot selectedValue={selectedValue}
                      onSelect={onSelect}>
                <TreeLeaf value="/" primaryText="Dashboard" />
                <TreeLeaf value="/streams/all/"
                          primaryText="All"
                          secondaryText={Number(subscriptions.totalUnreadCount).toLocaleString()} />
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
                {userCategories}
                {uncategorizedSubscriptions}
                <TreeLeaf value="/settings/" primaryText="Settings" />
                <TreeLeaf value="/about/" primaryText="About..." />
            </TreeRoot>
        );
    }
}