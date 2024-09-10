import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import type { Category, Feed, Subscription } from 'feedpon-messaging';
import type { createCategory } from 'feedpon-messaging/categories';
import type {
  addToCategory,
  removeFromCategory,
  subscribe,
  unsubscribe,
} from 'feedpon-messaging/subscriptions';
import React from 'react';

import { reactElement } from '../directives/reactElement';
import SubscribeDropdown from './SubscribeDropdown';

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

export default function FeedHeader(
  {
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
  }: FeedHeaderProps,
  context: RenderContext,
): TemplateResult {
  const feedLink = feed.url
    ? context.html`<a target="_blank" class="link-strong" href=${feed.url} rel="external">${feed.title}</a>`
    : context.html`<strong>${feed.title}</strong>`;

  return context.html`
    <header class="stream-header">
      <div class="container">
        <div class="u-flex u-flex-align-items-center u-flex-justify-content-between">
          <div class="u-margin-right-2 u-flex-grow-1">
            <div>
              <${feedLink}>
            </div>
            <div class="u-text-wrap">${feed.description}</div>
            <div>
              <a
                class="u-text-wrap"
                target="_blank"
                href=${feed.feedUrl}
                rel="noreferrer"
              >
                ${feed.feedUrl}
              </a>
            </div>
            <div class="list-inline list-inline-dotted">
              <div class="list-inline-item u-text-muted">
                <span class="u-text-4">${numEntries}${hasMoreEntries ? '+' : ''}</span> entries
              </div>
              <div class="list-inline-item u-text-muted">
                <span class="u-text-4">${feed.subscribers}</span> subscribers
              </div>
            </div>
          </div>
          <${reactElement(
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
            />,
          )}>
        </div>
      </div>
    </header>
  `;
}
