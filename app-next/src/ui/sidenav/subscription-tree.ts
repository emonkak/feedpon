import type { Category, Subscription } from '@feedpon/feedly-client';
import type { VComponent } from 'barebind';
import { html, type VElement } from 'barebind';
import { orderByAscending } from '../../foundation/comparer.ts';
import { Tree, TreeItem, type TreeItemProps } from '../primitives/tree.ts';

interface SubscriptionTreeProps {
  subscriptions: Subscription[];
  url: string;
}

export function SubscriptionTree({
  subscriptions,
  url,
}: SubscriptionTreeProps) {
  const sortedSubscriptions = subscriptions.toSorted(
    orderByAscending((subscription) => subscription.id),
  );
  const categories = new Map<string, Category>();
  const subscriptionsByCategory = new Map<string, Subscription[]>();
  const uncagorizedSubscriptions: Subscription[] = [];

  for (const subscription of sortedSubscriptions) {
    for (const category of subscription.categories) {
      categories.getOrInsert(category.id, category);
      subscriptionsByCategory.getOrInsert(category.id, []).push(subscription);
    }
    if (subscription.categories.length === 0) {
      uncagorizedSubscriptions.push(subscription);
    }
  }

  const children = categories
    .values()
    .toArray()
    .sort(orderByAscending((category) => category.label))
    .map((category) =>
      renderCategory(category, subscriptionsByCategory.get(category.id)!, url),
    )
    .concat(
      uncagorizedSubscriptions.map((subscription) =>
        renderSubscription(subscription, url),
      ),
    );

  return Tree({
    ariaLabel: 'Subscriptions',
    children,
  });
}

function renderCategory(
  category: Category,
  subscriptions: Subscription[],
  currentURL: string,
): VComponent<TreeItemProps> {
  const url = `/streams/${encodeURIComponent(category.id)}`;
  const children = subscriptions.map((subscription) =>
    renderSubscription(subscription, currentURL),
  );
  const content = html`
    <div aria-hidden="true" class="Tree-Item-icon EmojiIcon">
      <span class="EmojiIcon-glyph">📁</span>
    </div>
    <div class="Tree-Item-label">${category.label}</div>
  `;
  return TreeItem({
    ariaLabel: category.label,
    children,
    content,
    href: '#' + url,
    selected: url === currentURL,
  }).withKey(category.id);
}

function renderFavicon(subscription: Subscription): VElement {
  return subscription.iconUrl !== undefined
    ? html`
      <img
        alt=${subscription.title}
        aria-hidden="true"
        class="Tree-Item-icon"
        height="16"
        src=${subscription.iconUrl}
        width="16"
      >
    `
    : html`
      <div aria-hidden="true" class="Tree-Item-icon EmojiIcon">
        <span class="EmojiIcon-glyph">📄</span>
      </div>
    `;
}

function renderSubscription(
  subscription: Subscription,
  currentURL: string,
): VComponent<TreeItemProps> {
  const url = `/streams/${encodeURIComponent(subscription.id)}`;
  const content = html`
    <${renderFavicon(subscription)}>
    <div class="Tree-Item-label">${subscription.title}</div>
  `;
  return TreeItem({
    ariaLabel: subscription.title,
    content,
    href: '#' + url,
    selected: url === currentURL,
  }).withKey(subscription.id);
}
