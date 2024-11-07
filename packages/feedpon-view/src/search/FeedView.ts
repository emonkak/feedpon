import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import type { Category, Feed, Subscription } from 'feedpon-messaging';
import { SubscriptionSettingsDropdown } from '../common/SubscriptionSettingsDropdown';

interface FeedViewProps {
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
  subscription: Subscription | null;
}

export function FeedView(
  {
    categories,
    feed,
    onAddToCategory,
    onCreateCategory,
    onRemoveFromCategory,
    onSubscribe,
    onUnsubscribe,
    subscription,
  }: FeedViewProps,
  context: RenderContext,
): TemplateResult {
  return context.html`
    <li class="list-group-item">
      <div class="u-flex u-flex-justify-content-between u-flex-align-items-center">
        <div class="u-flex-grow-1 u-margin-right-2">
          <a
            class="link-strong"
            href=${`#/streams/${encodeURIComponent(feed.streamId)}`}
          >
            ${feed.title}
          </a>
          <div class="u-text-7">
            <strong>${feed.subscribers}</strong> subscribers
          </div>
          <div class="u-text-muted">${feed.description}</div>
        </div>
        <${component(SubscriptionSettingsDropdown, {
          className: 'u-flex-shrink-0',
          categories,
          feed,
          onAddToCategory,
          onCreateCategory,
          onRemoveFromCategory,
          onSubscribe,
          onUnsubscribe,
          subscription,
        })}>
      </div>
    </li>
  `;
}
