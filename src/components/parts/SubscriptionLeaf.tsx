import React from 'react';
import classnames from 'classnames';

import { TreeLeaf } from 'components/parts/Tree';
import SubscriptionIcon from 'components/parts/SubscriptionIcon';

interface SubscriptionLeafProps {
    iconUrl: string;
    isSelected: boolean;
    path: string;
    title: string;
    unreadCount: number;
}

const SubscriptionLeaf: React.SFC<SubscriptionLeafProps> = ({
    iconUrl,
    isSelected,
    path,
    title,
    unreadCount,
}) => {
    return (
        <TreeLeaf
            value={path}
            isSelected={isSelected}
            className={classnames({ 'is-important': unreadCount > 0 })}
            primaryText={title}
            secondaryText={unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''}
            icon={<SubscriptionIcon title={title} iconUrl={iconUrl} />} />
    );
};

export default SubscriptionLeaf;
