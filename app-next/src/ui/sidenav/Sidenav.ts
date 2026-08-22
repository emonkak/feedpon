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

export interface SidenavProps {
  scene: NavigationScene;
}

export const Sidenav = createComponent(function Sidenav({
  scene,
}: SidenavProps) {
  const store = this.inject(AppStore);
  const [subscriptions, _reloadSubscriptions] = this.use(
    AsyncResource(
      ({ reload, signal }) =>
        store.dispatch(loadSubscriptions({ reload, signal })),
      [],
      [] as Subscription[],
    ),
  );
  const treeItems = this.useMemo(
    () => renderTreeItems(subscriptions.value, scene.url),
    [subscriptions.value, scene.url],
  );

  return html`
    <div class="Sidenav" inert=${subscriptions.state === 'pending'}>
      <header class="Sidenav-Header">
        <menu class="SideNav-Toolbar" role="toolbar">
          <li class="SideNav-Toolbar-Item">
            <button
              aria-label="Add feeds"
              class="Button default"
              title="Add feeds"
            >
              <div aria-hidden="true" class="EmojiIcon">
                <span>➕</span>
              </div>
            </button>
          </li>
          <li class="SideNav-Toolbar-Item">
            <button
              aria-label="Reload feeds"
              class="Button default"
              title="Reload feeds"
            >
              <div aria-hidden="true" class="EmojiIcon">
                <span>🔄</span>
              </div>
            </button>
          </li>
          <li class="SideNav-Toolbar-Spacer"></li>
          <li class="SideNav-Toolbar-Item">
            <button
              aria-label="Toggle sidebar"
              class="Button default"
              title="Toggle sidebar"
            >
              <div aria-hidden="true" class="EmojiIcon">
                <span>⬅️</span>
              </div>
            </button>
          </li>
        </menu>
      </header>
      <div class="Sidenav-Main">
        <div class="Sidenav-Group">
          <${Tree({ ariaLabel: 'Subscriptions', children: treeItems })}>
        </div>
      </div>
    </div>
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
    <div aria-hidden="true" class="EmojiIcon" data-slot="icon">
      <span>📁</span>
    </div>
    <div data-slot="label">${category.label}</div>
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
          data-slot="icon"
          height="16"
          src=${subscription.iconUrl}
          width="16"
        >
      `
    : html`
        <div aria-hidden="true" class="EmojiIcon" data-slot="icon">
          <span>📄</span>
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
    <div data-slot="label">${subscription.title}</div>
  `;
  return TreeItem({
    ariaLabel: subscription.title,
    content,
    href: '#' + url,
    selected: url === currentURL,
  }).withKey(subscription.id);
}
