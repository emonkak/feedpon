import React from 'react';

import RelativeTime from '../components/RelativeTime';
import SubscriptionDropdown from './SubscriptionDropdown';
import SubscriptionIcon from './SubscriptionIcon';
import type { Category, Subscription } from 'feedpon-messaging';
import {
  addToCategory,
  removeFromCategory,
  unsubscribe,
} from 'feedpon-messaging/subscriptions';
import { createCategory } from 'feedpon-messaging/categories';

interface SubscriptionProps {
  categories: Category[];
  onAddToCategory: typeof addToCategory;
  onCreateCategory: typeof createCategory;
  onRemoveFromCategory: typeof removeFromCategory;
  onUnsubscribe: typeof unsubscribe;
  subscription: Subscription;
}

export default function SubscriptionComponent({
  categories,
  onAddToCategory,
  onCreateCategory,
  onRemoveFromCategory,
  onUnsubscribe,
  subscription,
}: SubscriptionProps) {
  const title = subscription.url ? (
    <a className="link-soft" target="_blank" href={subscription.url}>
      {subscription.title}
    </a>
  ) : (
    <span>{subscription.title}</span>
  );

  const labels = subscription.labels.map((label) => (
    <span key={label} className="badge badge-small badge-default">
      {label}
    </span>
  ));

  return (
    <li className="list-group-item">
      <div className="u-flex u-flex-align-items-center">
        <div className="u-flex-shrink-0 u-margin-right-2">
          <SubscriptionIcon
            title={subscription.title}
            iconUrl={subscription.iconUrl}
          />
        </div>
        <div className="u-flex-grow-1 u-margin-right-2">
          <div>
            {title}
            {labels}
          </div>
          <div className="u-text-7 u-text-wrap">
            <a target="_blank" href={subscription.feedUrl}>
              {subscription.feedUrl}
            </a>
          </div>
        </div>
        <div className="u-margin-right-2 u-text-right u-md-none">
          <RelativeTime
            className="u-text-7 u-text-muted"
            time={subscription.updatedAt}
          />
        </div>
        <SubscriptionDropdown
          className="u-flex-shrink-0"
          categories={categories}
          onAddToCategory={onAddToCategory}
          onCreateCategory={onCreateCategory}
          onRemoveFromCategory={onRemoveFromCategory}
          onUnsubscribe={onUnsubscribe}
          subscription={subscription}
        />
      </div>
    </li>
  );
}
