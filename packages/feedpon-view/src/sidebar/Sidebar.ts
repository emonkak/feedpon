import { createComponent, html } from 'barebind';
import { NavigationContext } from 'barebind/addons/router';

import { AppStore, getFeedUrl, type Subscription } from 'feedpon-store';
import * as authActions from 'feedpon-store/actions/auth';
import * as profileActions from 'feedpon-store/actions/profile';
import * as subscriptionActions from 'feedpon-store/actions/subscription';
import { BindActionCreators } from 'store';
import { AutoComplete } from '../primitives/AutoComplete.ts';
import type { MenuItem } from '../primitives/Menu.ts';
import { RelativeTime } from '../primitives/RelativeTime.ts';
import { ProfileDropdown } from './ProfileDropdown.ts';
import { SubscriptionsSettingsDropdown } from './SubscriptionsSettingsDropdown.ts';
import { SubscriptionsTree } from './SubscriptionsTree.ts';

export interface SidebarProps {}

export const Sidebar = createComponent<SidebarProps>(function Sidebar() {
  const { state$ } = this.use(AppStore);
  const { scene, adapter } = this.inject(NavigationContext);

  const allCategory = this.use(state$.get('allCategory'));
  const pinTag = this.use(state$.get('pinTag'));
  const profile = this.use(state$.get('profile'));
  const profileLoading = this.use(state$.get('profileLoading'));
  const selectedStreamId = this.use(
    state$
      .get('session')
      .map((session) =>
        session !== null && decodeURIComponent(scene.url).endsWith(session.id)
          ? session.id
          : null,
      ),
  );
  const subscriptions = this.use(state$.get('unsortedSubscriptions'));
  const subscriptionsLoading = this.use(state$.get('subscriptionsLoading'));
  const subscriptionsSettings = this.use(state$.get('subscriptionsSettings'));
  const subscriptionsTree = this.use(state$.get('subscriptionsTree'));
  const subscriptionsUpdated = this.use(state$.get('subscriptionsUpdated'));
  const totalUnreadCount = this.use(state$.get('totalUnreadCount'));

  const { updateSubscriptionsSettings, reloadSubscriptions } = this.use(
    BindActionCreators(AppStore, subscriptionActions),
  );
  const { revokeCredential } = this.use(
    BindActionCreators(AppStore, authActions),
  );
  const { reloadProfile } = this.use(
    BindActionCreators(AppStore, profileActions),
  );

  this.useEffect(() => {
    if (subscriptionsUpdated < 0) {
      reloadSubscriptions();
    }
  }, [subscriptionsUpdated]);

  this.useEffect(() => {
    if (profile === null) {
      reloadProfile();
    }
  }, [profile]);

  const handleSearch = (query: string) => {
    adapter.navigate('/search/' + encodeURIComponent(query));
  };

  const handleStreamSelect = (streamId: string) => {
    adapter.navigate('/streams/' + encodeURIComponent(streamId));
  };

  const handleSubscriptionsOrganize = () => {
    adapter.navigate('/categories');
  };

  const lastUpdate =
    subscriptionsUpdated >= 0
      ? html`
        <span>Updated <${RelativeTime({ time: subscriptionsUpdated })}></span>
      `
      : html`Not updated yet`;

  return html`
    <nav class="Sidebar">
      <div class="SidebarSection">
        <${AutoComplete({
          items: subscriptions,
          onSubmit: handleSearch,
          placeholder: 'Search for feeds ...',
          getFilteredItems,
        })}>
      </div>
      <div class="SidebarSection">
        <a
          class=${{
            SidebarItem: true,
            'is-selected': scene.url === '/',
          }}
          href='#/'
        >
          <span class="SidebarItem-label">Dashboard</span>
        </a>
        <${
          allCategory !== null
            ? html`
              <a
                class=${{
                  SidebarItem: true,
                  'is-selected':
                    scene.url ===
                    `/streams/${encodeURIComponent(allCategory.id)}`,
                }}
                href=${`#/streams/${allCategory?.id}`}
              >
                <span class="SidebarItem-label">All</span>
                <span class="SidebarItem-unread">${totalUnreadCount}</span>
              </a>
            `
            : null
        }>
        <${
          pinTag !== null
            ? html`
              <a
                class=${{
                  SidebarItem: true,
                  'is-selected':
                    scene.url === `/streams/${encodeURIComponent(pinTag.id)}`,
                }}
                href=${`#/streams/${pinTag.id}`}
              >
                <span class="SidebarItem-label">Pins</span>
              </a>
            `
            : null
        }>
      </div>
      <div class="SidebarSection">
        <header class="SidebarHeader">
          <button
            aria-label="Reload subscriptions"
            class="link-soft u-flex-shrink-0"
            disabled=${subscriptionsLoading}
            type="button"
            @click=${reloadSubscriptions}
          >
            <i
              class=${{
                'icon icon-16 icon-refresh': true,
                'animation-rotating': subscriptionsLoading,
              }}
              aria-hidden="true"
              role="img"
            ></i>
          </button>
          <strong class="u-flex-grow-1 u-text-7"><${lastUpdate}></strong>
          <${SubscriptionsSettingsDropdown({
            disabled: subscriptionsLoading,
            onSubscriptionsOrganize: handleSubscriptionsOrganize,
            onSubscriptionsSettingsUpdate: updateSubscriptionsSettings,
            subscriptionsSettings,
          })}>
        </header>
        <${SubscriptionsTree({
          ungroupedItems: subscriptionsTree.ungroupedItems,
          subscriptionGroups: subscriptionsTree.subscriptionGroups,
          selectedStreamId,
          onStreamSelect: handleStreamSelect,
        })}>
      </div>
      <div class="SidebarSection">
        <a
          class=${{
            SidebarItem: true,
            'is-selected': scene.url.startsWith('/settings/'),
          }}
          href="#/settings/appearance"
        >
          <span class="SidebarItem-label">Settings</span>
        </a>
        <a
          class=${{
            SidebarItem: true,
            'is-selected': scene.url === '/about',
          }}
          href="#/about"
        >
          <span class="SidebarItem-label">About</span>
        </a>
      </div>
      <div class="SidebarSection">
        <a
          class="button button-block button-outline-default"
          href="#/search/"
        >
          New Subscription
        </a>
      </div>
      <${
        profile !== null
          ? html`
            <div class="SidebarSection">
              <${ProfileDropdown({
                isLoading: profileLoading,
                onLogout: revokeCredential,
                onReload: reloadProfile,
                profile,
              })}>
            </div>
          `
          : null
      }>
    </nav>
  `;
});

function getFilteredItems(
  subscriptions: Subscription[],
  query: string,
): MenuItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === '') {
    return [];
  }

  const queryWords = query.trim().toLowerCase().split(/\s+/);
  const menuItems = filterNth(
    subscriptions,
    (subscription) =>
      queryWords.every(
        (queryWord) =>
          (subscription.title ?? '').toLowerCase().includes(queryWord) ||
          getFeedUrl(subscription.id).toLowerCase().includes(queryWord),
      ),
    10,
  ).map((subscription) => {
    const icon =
      subscription.iconUrl !== ''
        ? html`
          <img
            class="u-vertical-middle u-object-fit-cover"
            alt=${subscription.title}
            src=${subscription.iconUrl}
            width="16"
            height="16"
          >
        `
        : html`<i class="icon icon-16 icon-file "></i>`;

    return {
      type: 'link',
      key: subscription.id,
      children: html`
        <div class="MenuItem-icon"><${icon}></div>
        <div class="MenuItem-content">${subscription.title}</div>
      `,
      href: '#/streams/' + encodeURIComponent(subscription.id),
    } as MenuItem;
  });

  if (menuItems.length > 0) {
    menuItems.push(
      {
        type: 'separator',
        key: 'separator1',
      },
      {
        type: 'link',
        key: 'search_by_query',
        href: '#/search/' + encodeURIComponent(query),
        children: html`
          <div class="MenuItem-content">Search for "${query}"...</div>
        `,
      },
    );
  }

  return menuItems;
}

function filterNth<T>(
  elements: T[],
  predicate: (element: T) => boolean,
  n: number,
): T[] {
  const results = [];
  for (let i = 0, l = elements.length; i < l; i++) {
    const element = elements[i]!;
    if (predicate(element)) {
      if (results.push(element) >= n) {
        break;
      }
    }
  }
  return results;
}
