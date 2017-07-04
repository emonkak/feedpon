import React from 'react';
import classnames from 'classnames';

import SubscriptionLeaf from 'components/parts/SubscriptionLeaf';
import { Category, Subscription } from 'messaging/types';
import { TreeBranch } from 'components/parts/Tree';

interface CategoryBranchProps {
    category: Category;
    selectedPath: string;
    subscriptions: Subscription[];
    unreadCount: number;
}

const CategoryBranch: React.SFC<CategoryBranchProps> = ({
    category,
    unreadCount,
    selectedPath,
    subscriptions
}) => {
    const path = `/streams/${encodeURIComponent(category.streamId)}`;

    return (
        <TreeBranch
            value={path}
            isSelected={selectedPath.startsWith(path)}
            className={classnames({ 'is-important': unreadCount > 0 })}
            primaryText={category.label}
            secondaryText={unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''}>
            {subscriptions.map((subscription) => {
                const path =`/streams/${encodeURIComponent(subscription.streamId)}`;

                return (
                    <SubscriptionLeaf
                        key={subscription.subscriptionId}
                        iconUrl={subscription.iconUrl}
                        isSelected={selectedPath.startsWith(path)}
                        path={path}
                        title={subscription.title}
                        unreadCount={subscription.unreadCount} />
                );
            })}
        </TreeBranch>
    );
};

export default CategoryBranch;
