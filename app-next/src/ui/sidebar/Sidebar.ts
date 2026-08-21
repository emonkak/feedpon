import type { Category, Subscription } from '@feedpon/feedly-client';
import {
  createComponent,
  html,
  type VComponent,
  type VElement,
} from 'barebind';
import type { NavigationScene } from 'barebind/addons/router';
import { orderByAscending } from '../../foundation/comparer.ts';
import { loadSubscriptions } from '../../state/actions.ts';
import { AppStore } from '../../state/store.ts';
import { AsyncResource } from '../hooks/AsyncResource.ts';
import { Tree, TreeItem, type TreeItemProps } from '../primitives/Tree.ts';

export interface SidebarProps {
  scene: NavigationScene;
}

export const Sidebar = createComponent(function Sidebar({
  scene,
}: SidebarProps) {
  const store = this.inject(AppStore);
  const [subscriptions, _reloadSubscriptions] = this.use(
    AsyncResource(
      (reload, signal) => store.dispatch(loadSubscriptions({ reload, signal })),
      [],
      [] as Subscription[],
    ),
  );
  const treeItems = this.useMemo(
    () => renderTreeItems(subscriptions.value, scene.url),
    [subscriptions.value, scene.url],
  );

  return html`
    <nav class="Sidebar" inert=${subscriptions.state === 'pending'}>
      <ul class="Sidebar-Group">
        <${Tree({ ariaLabel: 'Subscriptions', children: treeItems })}>
      </ul>
    </nav>
  `;
});

function renderTreeItems(
  subscriptions: Subscription[],
  currentURL: string,
): VComponent<TreeItemProps>[] {
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
        currentURL,
      ),
    )
    .concat(
      uncagorizedSubscriptions.map((subscription) =>
        renderSubscription(subscription, currentURL),
      ),
    );
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
    <div>${category.label}</div>
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
          height="16"
          src=${subscription.iconUrl}
          width="16"
        >
      `
    : html`<i aria-hidden="true" class="EmojiIcon"><span>🌍️</span></i>`;
}

function renderSubscription(
  subscription: Subscription,
  currentURL: string,
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
    selected: url === currentURL,
  }).withKey(subscription.id);
}
