import React from 'react';
import { Link } from 'react-router-dom';

import SubscribeDropdown from './SubscribeDropdown';
import type { Category, Feed, Subscription } from 'feedpon-messaging';

interface FeedProps {
  categories: Category[];
  feed: Feed;
  onAddToCategory: (subscription: Subscription, label: string) => void;
  onCreateCategory: (
    label: string,
    callback: (category: Category) => void,
  ) => void;
  onRemoveFromCategory: (subscription: Subscription, label: string) => void;
  onSubscribe: (feed: Feed, labels: string[]) => void;
  onUnsubscribe: (subscription: Subscription) => void;
  subscription: Subscription;
}

const FeedComponent: React.FC<FeedProps> = ({
  categories,
  feed,
  onAddToCategory,
  onCreateCategory,
  onRemoveFromCategory,
  onSubscribe,
  onUnsubscribe,
  subscription,
}) => {
  return (
    <li className="list-group-item">
      <div className="u-flex u-flex-justify-content-between u-flex-align-items-center">
        <div className="u-flex-grow-1 u-margin-right-2">
          <Link
            className="link-strong"
            to={`/streams/${encodeURIComponent(feed.streamId)}`}
          >
            {feed.title}
          </Link>
          <div className="u-text-7">
            <strong>{feed.subscribers}</strong> subscribers
          </div>
          <div className="u-text-muted">{feed.description}</div>
        </div>
        <SubscribeDropdown
          className="u-flex-shrink-0"
          categories={categories}
          feed={feed}
          onAddToCategory={onAddToCategory}
          onCreateCategory={onCreateCategory}
          onRemoveFromCategory={onRemoveFromCategory}
          onSubscribe={onSubscribe}
          onUnsubscribe={onUnsubscribe}
          subscription={subscription}
        />
      </div>
    </li>
  );
};

export default FeedComponent;
