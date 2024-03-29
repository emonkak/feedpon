import React from 'react';
import classnames from 'classnames';

import Dropdown from 'view/components/Dropdown';
import RelativeTime from 'view/components/RelativeTime';
import { MenuItem } from 'view/components/Menu';
import { SubscriptionOrderKind } from 'messaging/types';

interface SubscriptionTreeHeaderProps {
    isLoading: boolean;
    lastUpdatedAt: number;
    onChangeSubscriptionOrder: (order: SubscriptionOrderKind) => void;
    onChangeUnreadViewing: (onlyUnread: boolean) => void;
    onOrganizeSubscriptions: () => void;
    onReload: () => void;
    onlyUnread: boolean;
    subscriptionOrder: SubscriptionOrderKind;
}

const SubscriptionTreeHeader: React.SFC<SubscriptionTreeHeaderProps> = ({
    isLoading,
    lastUpdatedAt,
    onChangeSubscriptionOrder,
    onChangeUnreadViewing,
    onOrganizeSubscriptions,
    onReload,
    onlyUnread,
    subscriptionOrder
}) => {
    const lastUpdate = lastUpdatedAt > 0
        ? <span>Updated <RelativeTime time={lastUpdatedAt} /></span>
        : 'Not updated yet';

    return (
        <header className="sidebar-group-header">
            <button
                className="link-soft u-flex-shrink-0"
                disabled={isLoading}
                onClick={onReload}>
                <i className={classnames('icon icon-16 icon-width-32 icon-refresh', {
                    'animation-rotating': isLoading
                })} />
            </button>
            <strong className="u-flex-grow-1 u-text-7">{lastUpdate}</strong>
            <Dropdown
                toggleButton={
                    <button className="link-soft u-flex-shrink-0">
                        <i className="icon icon-16 icon-width-32 icon-menu-2" />
                    </button>
                }>
                <div className="menu-heading">Order</div>
                <MenuItem
                    icon={subscriptionOrder === 'id' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeSubscriptionOrder}
                    primaryText="ID"
                    value="id" />
                <MenuItem
                    icon={subscriptionOrder === 'title' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeSubscriptionOrder}
                    primaryText="Title"
                    value="title" />
                <MenuItem
                    icon={subscriptionOrder === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeSubscriptionOrder}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    icon={subscriptionOrder === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeSubscriptionOrder}
                    primaryText="Oldest first"
                    value="oldest" />
                <div className="menu-divider" />
                <MenuItem
                    icon={onlyUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeUnreadViewing}
                    primaryText="Only unread"
                    value={!onlyUnread} />
                <div className="menu-divider" />
                <MenuItem
                    onSelect={onOrganizeSubscriptions}
                    primaryText="Organize subscriptions..." />
            </Dropdown>
        </header>
    );
};

export default SubscriptionTreeHeader;
