import { component, type RenderContext, repeat } from 'barebind';
import type { Category, Subscription } from 'feedpon-messaging';
import type { createCategory } from 'feedpon-messaging/categories';
import type {
  addToCategory,
  removeFromCategory,
  unsubscribe,
} from 'feedpon-messaging/subscriptions';

import { RelativeTime } from '../primitives/RelativeTime.ts';
import { SubscriptionDropdown } from './SubscriptionDropdown.ts';

interface SubscriptionViewProps {
  categories: Category[];
  onAddToCategory: typeof addToCategory;
  onCreateCategory: typeof createCategory;
  onRemoveFromCategory: typeof removeFromCategory;
  onUnsubscribe: typeof unsubscribe;
  subscription: Subscription;
}

export function SubscriptionView(
  {
    categories,
    onAddToCategory,
    onCreateCategory,
    onRemoveFromCategory,
    onUnsubscribe,
    subscription,
  }: SubscriptionViewProps,
  context: RenderContext,
): unknown {
  const title = subscription.url
    ? context.html`
      <a
        class="link-soft"
        href=${subscription.url}
        rel="noreferrer"
        target="_blank"
      >
        ${subscription.title}
      </a>
    `
    : context.html`
      <span>${subscription.title}</span>
    `;

  const labels = repeat({
    source: subscription.labels,
    keySelector: (label) => label,
    valueSelector: (label) => context.html`
      <span class="badge badge-small badge-default">
        ${label}
      </span>
    `,
  });

  const icon =
    subscription.iconUrl !== ''
      ? context.html`
      <img
        class="u-vertical-middle u-object-fit-cover"
        alt=${subscription.title}
        src=${subscription.iconUrl}
        width="16"
        height="16"
      >
    `
      : context.html`<i class="icon icon-16 icon-file"></i>`;

  return context.html`
    <li class="list-group-item">
      <div class="u-flex u-flex-align-items-center">
        <div class="u-flex-shrink-0 u-margin-right-2">
          <${icon}>
        </div>
        <div class="u-flex-grow-1 u-margin-right-2">
          <div>
            <${title}>
            <${labels}>
          </div>
          <div class="u-text-7 u-text-wrap">
            <a target="_blank" href={subscription.feedUrl} rel="noreferrer">
              ${subscription.feedUrl}
            </a>
          </div>
        </div>
        <div class="u-margin-right-2 u-text-right u-md-none">
          <${component(RelativeTime, {
            class: 'u-text-7 u-text-muted',
            time: subscription.updatedAt,
          })}>
        </div>
        <div class="u-flex-shrink-0">
          <${component(SubscriptionDropdown, {
            categories,
            onAddToCategory,
            onCreateCategory,
            onRemoveFromCategory,
            onUnsubscribe,
            subscription,
          })}>
        </div>
      </div>
    </li>
  `;
}
