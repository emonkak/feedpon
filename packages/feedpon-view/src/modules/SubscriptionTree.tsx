import React from 'react';

import SubscriptionIcon from './SubscriptionIcon';
import type {
  Category,
  GroupedSubscription,
  Subscription,
} from 'feedpon-messaging';
import { Tree, TreeLeaf, TreeBranch } from '../components/Tree';
import { UNCATEGORIZED } from 'feedpon-messaging/categories';

interface SubscriptionTreeProps {
  categories: Category[];
  groupedSubscriptions: { [key: string]: GroupedSubscription };
  onSelect: (value: string) => void;
  selectedPath: string;
}

export default function SubscriptionTree({
  categories,
  groupedSubscriptions,
  onSelect,
  selectedPath,
}: SubscriptionTreeProps) {
  const visibleCategories = categories
    .filter((category) => groupedSubscriptions.hasOwnProperty(category.label))
    .map((category) => {
      const { items, unreadCount } = groupedSubscriptions[category.label]!;
      const path = `/streams/${encodeURIComponent(category.streamId)}`;
      const children = items.map(renderSubscription);

      return (
        <TreeBranch
          key={category.categoryId}
          value={path}
          isImportant={unreadCount > 0}
          primaryText={category.label}
          secondaryText={
            unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''
          }
        >
          {children}
        </TreeBranch>
      );
    });

  const uncategorizedSubscriptions = (
    groupedSubscriptions[UNCATEGORIZED]?.items ?? []
  ).map(renderSubscription);

  return (
    <Tree selectedValue={selectedPath} onSelect={onSelect}>
      {visibleCategories}
      {uncategorizedSubscriptions}
    </Tree>
  );
}

function renderSubscription(subscription: Subscription) {
  const path = `/streams/${encodeURIComponent(subscription.streamId)}`;
  const unreadCount =
    subscription.unreadCount > subscription.readCount
      ? subscription.unreadCount - subscription.readCount
      : 0;

  return (
    <TreeLeaf
      key={subscription.subscriptionId}
      primaryText={subscription.title}
      secondaryText={
        unreadCount > 0 ? Number(unreadCount).toLocaleString() : ''
      }
      icon={
        <SubscriptionIcon
          title={subscription.title}
          iconUrl={subscription.iconUrl}
        />
      }
      value={path}
      isImportant={unreadCount > 0}
    />
  );
}
