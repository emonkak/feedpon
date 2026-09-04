import type {
  Category,
  Subscription,
  UnreadCount,
} from '@feedpon/feedly-client';
import type { VComponent } from 'barebind';
import { html, type VElement } from 'barebind';
import { orderByAscending } from '../../foundation/comparer.ts';
import { Tree, TreeItem, type TreeItemProps } from '../primitives/tree.ts';

interface SubscriptionTreeProps {
  subscriptions: Subscription[];
  unreadCounts: UnreadCount[];
  url: string;
}

export function SubscriptionTree({
  subscriptions,
  unreadCounts,
  url,
}: SubscriptionTreeProps) {
  const sortedSubscriptions = subscriptions.toSorted(
    orderByAscending((subscription) => subscription.id),
  );
  const categoriesById = new Map<string, Category>();
  const subscriptionsByCategoryId = new Map<string, Subscription[]>();
  const uncagorizedSubscriptions: Subscription[] = [];
  const unreadCountsById = new Map<string, UnreadCount>();

  for (const subscription of sortedSubscriptions) {
    for (const category of subscription.categories) {
      categoriesById.getOrInsert(category.id, category);
      subscriptionsByCategoryId.getOrInsert(category.id, []).push(subscription);
    }

    if (subscription.categories.length === 0) {
      uncagorizedSubscriptions.push(subscription);
    }
  }

  for (const unreadCount of unreadCounts) {
    unreadCountsById.set(unreadCount.id, unreadCount);
  }

  const children = categoriesById
    .values()
    .toArray()
    .sort(orderByAscending((category) => category.label))
    .map((category) =>
      renderCategory(
        category,
        subscriptionsByCategoryId.get(category.id)!,
        unreadCountsById,
        url,
      ),
    )
    .concat(
      uncagorizedSubscriptions.map((subscription) =>
        renderSubscription(subscription, unreadCountsById, url),
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
  unreadCountMap: Map<string, UnreadCount>,
  currentURL: string,
): VComponent<TreeItemProps> {
  const unreadCount = unreadCountMap.get(category.id)?.count ?? 0;
  const url = `/streams/${encodeURIComponent(category.id)}`;
  const children = subscriptions.map((subscription) =>
    renderSubscription(subscription, unreadCountMap, currentURL),
  );
  const content = html`
    <div aria-hidden="true" class="Tree-Item-icon EmojiIcon">
      <span class="EmojiIcon-glyph">📁</span>
    </div>
    <div class="Tree-Item-label">${category.label}</div>
    <div class="Tree-Item-info Badge primary small">${unreadCount > 0 ? unreadCount : undefined}</div>
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
  unreadCountMap: Map<string, UnreadCount>,
  currentURL: string,
): VComponent<TreeItemProps> {
  const unreadCount = unreadCountMap.get(subscription.id)?.count ?? 0;
  const url = `/streams/${encodeURIComponent(subscription.id)}`;
  const content = html`
    <${renderFavicon(subscription)}>
    <div class="Tree-Item-label">${subscription.title}</div>
    <div class="Tree-Item-info Badge primary small">${unreadCount > 0 ? unreadCount : undefined}</div>
  `;
  return TreeItem({
    ariaLabel: subscription.title,
    content,
    href: '#' + url,
    selected: url === currentURL,
  }).withKey(subscription.id);
}
