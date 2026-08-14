import type { Category, Subscription } from '@feedpon/feedly-client';
import { createComponent, html, type VComponent } from 'barebind';
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

function renderSubscriptionNode(
  subscription: Subscription,
  scene: NavigationScene,
): VComponent<TreeNodeProps> {
  const url = `/streams/${encodeURIComponent(subscription.id)}`;
  const iconUrl =
    subscription.iconUrl ??
    (subscription.website !== undefined
      ? `https://t2.gstatic.com/faviconV2?url=${encodeURIComponent(subscription.website)}&size=32`
      : 'https://t2.gstatic.com/faviconV2');
  const content = html`
    <img
      alt=${subscription.title}
      src=${iconUrl}
      width="16"
      height="16"
    >
    <div>${subscription.title}</div>
  `;
  return TreeNode({
    content,
    href: '#' + url,
    selected: scene.url === url,
  }).withKey(subscription.id);
}
