import { createComponent, type RenderContext } from 'barebind';
import {
  type Category,
  type Feed,
  getFeedUrl,
  type Subscription,
} from 'feedpon-store';
import { SubscriptionSettingsDropdown } from '../subscription/SubscriptionSettingsDropdown.ts';

interface FeedHeaderProps {
  categories: Category[];
  feed: Feed;
  onCategoryCreate: (label: string) => Promise<void>;
  onSubscriptionCreate: (feed: Feed, labels: string[]) => Promise<void>;
  onSubscriptionDelete: (subscriptionId: string) => Promise<void>;
  onSubscriptionUpdate: (
    subscriptionId: string,
    labels: string[],
  ) => Promise<void>;
  subscription: Subscription | null;
}

export const FeedHeader = createComponent(function FeedHeader(
  {
    categories,
    feed,
    onCategoryCreate,
    onSubscriptionCreate,
    onSubscriptionDelete,
    onSubscriptionUpdate,
    subscription,
  }: FeedHeaderProps,
  $: RenderContext,
): unknown {
  const feedUrl = getFeedUrl(feed.id);
  const feedLink =
    feed.website !== undefined
      ? $.html`<a target="_blank" class="link-strong" href=${feed.website} rel="noreferrer">${feed.title}</a>`
      : $.html`<strong>${feed.title}</strong>`;

  return $.html`
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
                href=${feedUrl}
                rel="noreferrer"
              >
                ${feedUrl}
              </a>
            </div>
            <div class="list-inline list-inline-dotted">
              <div class="list-inline-item u-text-muted">
                <span class="u-text-4">${feed.subscribers}</span> subscribers
              </div>
            </div>
          </div>
          <div class="u-flex-shrink-0">
            <${SubscriptionSettingsDropdown({
              categories,
              feed,
              onCategoryCreate,
              onSubscriptionCreate,
              onSubscriptionDelete,
              onSubscriptionUpdate,
              subscription,
            })}>
          </div>
        </div>
      </div>
    </header>
  `;
});
