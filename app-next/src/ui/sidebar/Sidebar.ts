import type { Category, Subscription } from '@feedpon/feedly-client';
import {
  createComponent,
  html,
  type VComponent,
  type VElement,
} from 'barebind';
import type { NavigationScene } from 'barebind/addons/router';
import { orderByAscending } from '../../foundation/comparer.ts';
import { Tree, TreeNode, type TreeNodeProps } from '../primitives/Tree.ts';

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
        renderCategoryNode(
          category,
          subscriptionsByCategory.get(category.id)!,
          scene,
        ),
      )
      .concat(
        uncagorizedSubscriptions.map((subscription) =>
          renderSubscriptionNode(subscription, scene),
        ),
      );
  }, [scene, subscriptions]);

  return html`
    <nav class="Sidebar">
      <ul class="Sidebar-Group">
        <${Tree({ children: treeNodes })}>
      </ul>
    </nav>
  `;
});

function renderCategoryNode(
  category: Category,
  subscriptions: Subscription[],
  scene: NavigationScene,
): VComponent<TreeNodeProps> {
  const url = `/streams/${encodeURIComponent(category.id)}`;
  const children = subscriptions.map((subscription) =>
    renderSubscriptionNode(subscription, scene),
  );
  const content = html`
    <div>${category.label}</div>
  `;
  return TreeNode({
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

function renderSubscriptionNode(
  subscription: Subscription,
  scene: NavigationScene,
): VComponent<TreeNodeProps> {
  const url = `/streams/${encodeURIComponent(subscription.id)}`;
  const content = html`
    <${renderFavicon(subscription)}>
    <div>${subscription.title}</div>
  `;
  return TreeNode({
    content,
    href: '#' + url,
    selected: scene.url === url,
  }).withKey(subscription.id);
}
