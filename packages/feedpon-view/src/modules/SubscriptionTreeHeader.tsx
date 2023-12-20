import classnames from 'classnames';
import React from 'react';

import type { SubscriptionOrderKind } from 'feedpon-messaging';
import Dropdown from '../components/Dropdown';
import { MenuItem } from '../components/Menu';
import RelativeTime from '../components/RelativeTime';
import useEvent from '../hooks/useEvent';

interface SubscriptionTreeHeaderProps {
  isLoading: boolean;
  lastUpdatedAt: number;
  onChangeOnlyUnread: (onlyUnread: boolean) => void;
  onChangeSubscriptionOrder: (order: SubscriptionOrderKind) => void;
  onManageSubscriptions: () => void;
  onReload: () => void;
  onlyUnread: boolean;
  subscriptionOrder: SubscriptionOrderKind;
}

type Action =
  | {
      type: 'CHANGE_SUBSCRIPTION_ORDER';
      subscriptionOrder: SubscriptionOrderKind;
    }
  | { type: 'CHANGE_ONLY_UNREAD'; enabled: boolean }
  | { type: 'MANAGE_SUBSCRIPTIONS' };

export default function SubscriptionTreeHeader({
  isLoading,
  lastUpdatedAt,
  onChangeSubscriptionOrder,
  onChangeOnlyUnread,
  onManageSubscriptions,
  onReload,
  onlyUnread,
  subscriptionOrder,
}: SubscriptionTreeHeaderProps) {
  const handleSelectAction = useEvent((action: Action) => {
    switch (action.type) {
      case 'CHANGE_SUBSCRIPTION_ORDER':
        onChangeSubscriptionOrder(action.subscriptionOrder);
        break;
      case 'CHANGE_ONLY_UNREAD':
        onChangeOnlyUnread(action.enabled);
        break;
      case 'MANAGE_SUBSCRIPTIONS':
        onManageSubscriptions();
        break;
    }
  });

  const lastUpdate =
    lastUpdatedAt > 0 ? (
      <span>
        Updated <RelativeTime time={lastUpdatedAt} />
      </span>
    ) : (
      'Not updated yet'
    );

  return (
    <header className="sidebar-group-header">
      <button
        className="link-soft u-flex-shrink-0"
        disabled={isLoading}
        onClick={onReload}
      >
        <i
          className={classnames('icon icon-16 icon-width-32 icon-refresh', {
            'animation-rotating': isLoading,
          })}
        />
      </button>
      <strong className="u-flex-grow-1 u-text-7">{lastUpdate}</strong>
      <Dropdown
        onSelect={handleSelectAction}
        toggleButton={
          <button className="link-soft u-flex-shrink-0">
            <i className="icon icon-16 icon-width-32 icon-menu-2" />
          </button>
        }
      >
        <div className="menu-heading">Order</div>
        <MenuItem<Action>
          value={{
            type: 'CHANGE_SUBSCRIPTION_ORDER',
            subscriptionOrder: 'id',
          }}
          icon={
            subscriptionOrder === 'id' ? (
              <i className="icon icon-16 icon-checkmark" />
            ) : null
          }
          primaryText="ID"
        />
        <MenuItem<Action>
          value={{
            type: 'CHANGE_SUBSCRIPTION_ORDER',
            subscriptionOrder: 'title',
          }}
          icon={
            subscriptionOrder === 'title' ? (
              <i className="icon icon-16 icon-checkmark" />
            ) : null
          }
          primaryText="Title"
        />
        <MenuItem<Action>
          value={{
            type: 'CHANGE_SUBSCRIPTION_ORDER',
            subscriptionOrder: 'newest',
          }}
          icon={
            subscriptionOrder === 'newest' ? (
              <i className="icon icon-16 icon-checkmark" />
            ) : null
          }
          primaryText="Newest first"
        />
        <MenuItem<Action>
          value={{
            type: 'CHANGE_SUBSCRIPTION_ORDER',
            subscriptionOrder: 'oldest',
          }}
          icon={
            subscriptionOrder === 'oldest' ? (
              <i className="icon icon-16 icon-checkmark" />
            ) : null
          }
          primaryText="Oldest first"
        />
        <div className="menu-divider" />
        <MenuItem<Action>
          value={{
            type: 'CHANGE_ONLY_UNREAD',
            enabled: !onlyUnread,
          }}
          icon={
            onlyUnread ? <i className="icon icon-16 icon-checkmark" /> : null
          }
          primaryText="Only unread"
        />
        <div className="menu-divider" />
        <MenuItem<Action>
          value={{ type: 'MANAGE_SUBSCRIPTIONS' }}
          primaryText="Manage subscriptions..."
        />
      </Dropdown>
    </header>
  );
}
