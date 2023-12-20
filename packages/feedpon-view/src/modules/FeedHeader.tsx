import React from 'react';

import SubscribeDropdown from './SubscribeDropdown';
import type { Category, Feed, Subscription } from 'feedpon-messaging';
import {
  addToCategory,
  removeFromCategory,
  subscribe,
  unsubscribe,
} from 'feedpon-messaging/subscriptions';
import { createCategory } from 'feedpon-messaging/categories';

interface FeedHeaderProps {
  categories: Category[];
  feed: Feed;
  hasMoreEntries: boolean;
  numEntries: number;
  onAddToCategory: typeof addToCategory;
  onCreateCategory: typeof createCategory;
  onRemoveFromCategory: typeof removeFromCategory;
  onSubscribe: typeof subscribe;
  onUnsubscribe: typeof unsubscribe;
  subscription: Subscription | null;
}

export default function FeedHeader({
  categories,
  feed,
  hasMoreEntries,
  numEntries,
  onAddToCategory,
  onCreateCategory,
  onRemoveFromCategory,
  onSubscribe,
  onUnsubscribe,
  subscription,
}: FeedHeaderProps) {
  return (
    <header className="stream-header">
      <div className="container">
        <div className="u-flex u-flex-align-items-center u-flex-justify-content-between">
          <div className="u-margin-right-2 u-flex-grow-1">
            <div>
              {feed.url ? (
                <a target="_blank" className="link-strong" href={feed.url}>
                  {feed.title}
                </a>
              ) : (
                <strong>{feed.title}</strong>
              )}
            </div>
            <div className="u-text-wrap">{feed.description}</div>
            <div>
              <a className="u-text-wrap" target="_blank" href={feed.feedUrl}>
                {feed.feedUrl}
              </a>
            </div>
            <div className="list-inline list-inline-dotted">
              <div className="list-inline-item u-text-muted">
                <span className="u-text-4">
                  {numEntries}
                  {hasMoreEntries && '+'}
                </span>{' '}
                entries
              </div>
              <div className="list-inline-item u-text-muted">
                <span className="u-text-4">{feed.subscribers}</span> subscribers
              </div>
            </div>
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
      </div>
    </header>
  );
}
