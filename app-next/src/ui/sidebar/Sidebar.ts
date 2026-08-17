import type { Category, Subscription } from '@feedpon/feedly-client';
import {
  createComponent,
  html,
  type VComponent,
  type VElement,
} from 'barebind';
import type { NavigationScene } from 'barebind/addons/router';
import { orderByAscending } from '../../foundation/comparer.ts';
import { Tree, TreeItem, type TreeItemProps } from '../primitives/Tree.ts';

export interface SidebarProps {
  scene: NavigationScene;
  subscriptions: Subscription[];
}

export const Sidebar = createComponent(function Sidebar({
  scene,
  subscriptions,
}: SidebarProps) {
  const treeNodes = this.useMemo(() => {
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

    return categories
      .values()
      .toArray()
      .sort(orderByAscending((category) => category.label))
      .map((category) =>
        renderCategory(
          category,
          subscriptionsByCategory.get(category.id)!,
          scene,
        ),
      )
      .concat(
        uncagorizedSubscriptions.map((subscription) =>
          renderSubscription(subscription, scene),
        ),
      );
  }, [scene, subscriptions]);

  return html`
    <nav class="Sidebar">
      <ul class="Sidebar-Group">
        <${Tree({ ariaLabel: 'Subscriptions', children: treeNodes })}>
      </ul>
    </nav>
  `;
});

function renderCategory(
  category: Category,
  subscriptions: Subscription[],
  scene: NavigationScene,
): VComponent<TreeItemProps> {
  const url = `/streams/${encodeURIComponent(category.id)}`;
  const children = subscriptions.map((subscription) =>
    renderSubscription(subscription, scene),
  );
  const content = html`
    <div>${category.label}</div>
  `;
  return TreeItem({
    ariaLabel: category.label,
    children,
    content,
    href: '#' + url,
    selected: scene.url === url,
  }).withKey(category.id);
}

function renderFavicon(subscription: Subscription): VElement {
  return subscription.iconUrl !== undefined
    ? html`
        <img
          alt=${subscription.title}
          aria-hidden="true"
          height="16"
          src=${subscription.iconUrl}
          width="16"
        >
      `
    : html`<i aria-hidden="true" class="EmojiIcon"><span>🌍️</span></i>`;
}

function renderSubscription(
  subscription: Subscription,
  scene: NavigationScene,
): VComponent<TreeItemProps> {
  const url = `/streams/${encodeURIComponent(subscription.id)}`;
  const content = html`
    <${renderFavicon(subscription)}>
    <div>${subscription.title}</div>
  `;
  return TreeItem({
    ariaLabel: subscription.title,
    content,
    href: '#' + url,
    selected: scene.url === url,
  }).withKey(subscription.id);
}
