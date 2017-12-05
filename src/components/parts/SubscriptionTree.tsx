import React, { PureComponent } from 'react';
import classnames from 'classnames';

import SubscriptionIcon from 'components/parts/SubscriptionIcon';
import { Category, GroupedSubscription, Subscription } from 'messaging/types';
import { Tree, TreeLeaf, TreeBranch } from 'components/widgets/Tree';
import { UNCATEGORIZED } from 'messaging/categories/constants';

interface SubscriptionTreeProps {
    categories: Category[];
    groupedSubscriptions: { [key: string]: GroupedSubscription };
    onSelect: (value: string) => void;
    selectedPath: string;
}

export default class SubscriptionTree extends PureComponent<SubscriptionTreeProps, {}> {
    renderCategory(category: Category, subscriptions: Subscription[], unreadCount: number) {
        const { onSelect, selectedPath } = this.props;
        const path = `/streams/${encodeURIComponent(category.streamId)}`;

        return (
            <TreeBranch
                key={category.categoryId}
                value={path}
                isSelected={selectedPath.startsWith(path)}
                className={classnames({ 'is-important': unreadCount > 0 })}
                primaryText={category.label}
                secondaryText={unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''}
                onSelect={onSelect}>
                {subscriptions.map(this.renderSubscription, this)}
            </TreeBranch>
        );
    }

    renderSubscription(subscription: Subscription) {
        const { onSelect, selectedPath } = this.props;
        const path = `/streams/${encodeURIComponent(subscription.streamId)}`;
        const unreadCount = subscription.unreadCount > subscription.readCount
            ? subscription.unreadCount - subscription.readCount
            : 0;

        return (
            <TreeLeaf
                key={subscription.subscriptionId}
                className={classnames({ 'is-important': unreadCount > 0 })}
                primaryText={subscription.title}
                secondaryText={unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''}
                icon={<SubscriptionIcon title={subscription.title} iconUrl={subscription.iconUrl} />}
                value={path}
                isSelected={selectedPath.startsWith(path)}
                onSelect={onSelect} />
        );
    }

    render() {
        const { categories, groupedSubscriptions } = this.props;

        const visibleCategories = categories
            .filter((category) => groupedSubscriptions.hasOwnProperty(category.label))
            .map((category) => ({ category, groupedSubscription: groupedSubscriptions[category.label]! }));

        const uncategorizedSubscriptions = groupedSubscriptions[UNCATEGORIZED]
            ? groupedSubscriptions[UNCATEGORIZED].items
            : [];

        return (
            <Tree>
                {visibleCategories.map(({ category, groupedSubscription }) =>
                    this.renderCategory(category, groupedSubscription.items, groupedSubscription.unreadCount))}
                {uncategorizedSubscriptions.map(this.renderSubscription, this)}
            </Tree>
        );
    }
}
