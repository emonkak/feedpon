import { createComponent, type RenderContext, Repeat } from 'barebind';
import { type Category, getFeedUrl, type Subscription } from 'feedpon-store';
import { RelativeTime } from '../primitives/RelativeTime.ts';
import { SubscriptionDropdown } from './SubscriptionDropdown.ts';

interface SubscriptionViewProps {
  categories: Category[];
  onCategoryCreate: (label: string) => Promise<void>;
  onSubscriptionDelete: (subscriptionId: string) => Promise<void>;
  onSubscriptionUpdate: (
    subscriptionId: string,
    labels: string[],
  ) => Promise<void>;
  subscription: Subscription;
}

export const SubscriptionView = createComponent(function SubscriptionView(
  {
    categories,
    onCategoryCreate,
    onSubscriptionUpdate,
    onSubscriptionDelete,
    subscription,
  }: SubscriptionViewProps,
  $: RenderContext,
): unknown {
  const feedUrl = getFeedUrl(subscription.id);
  const title =
    subscription.website !== undefined
      ? $.html`
      <a
        class="link-soft"
        href=${subscription.website}
        rel="noreferrer"
        target="_blank"
      >
        ${subscription.title}
      </a>
    `
      : $.html`
      <span>${subscription.title}</span>
    `;

  const labels = Repeat({
    items: subscription.categories,
    keySelector: (category) => category.label,
    valueSelector: (category) => $.html`
      <span class="badge badge-small badge-default">
        ${category.label}
      </span>
    `,
  });

  const icon =
    subscription.iconUrl !== ''
      ? $.html`
      <img
        class="u-vertical-middle u-object-fit-cover"
        alt=${subscription.title}
        src=${subscription.iconUrl}
        width="16"
        height="16"
      >
    `
      : $.html`<i class="icon icon-16 icon-file"></i>`;

  return $.html`
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
            <a target="_blank" href=${feedUrl} rel="noreferrer">
              ${feedUrl}
            </a>
          </div>
        </div>
        <div class="u-margin-right-2 u-text-right u-md-none">
          <${RelativeTime({
            class: 'u-text-7 u-text-muted',
            time: subscription.updated ?? 0,
          })}>
        </div>
        <div class="u-flex-shrink-0">
          <${SubscriptionDropdown({
            categories,
            onCategoryCreate,
            onSubscriptionDelete,
            onSubscriptionUpdate,
            subscription,
          })}>
        </div>
      </div>
    </li>
  `;
});
