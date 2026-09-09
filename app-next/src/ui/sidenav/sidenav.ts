import { createComponent, html } from 'barebind';
import type { NavigationScene } from 'barebind/addons/router';
import { reloadSubscriptions } from '../../state/actions.ts';
import { AppStore } from '../../state/store.ts';
import { RelativeTime } from '../primitives/relative-time.ts';
import { SubscriptionTree } from './subscription-tree.ts';

export interface SidenavProps {
  scene: NavigationScene;
}

export const Sidenav = createComponent(function Sidenav({
  scene,
}: SidenavProps) {
  const [isSyncing, setIsSyncing] = this.useState(false);
  const store = this.inject(AppStore);
  const lastSynced = this.use(
    store.state$.get('serverState').get('lastSynced'),
  );
  const subscriptions = this.use(store.state$.get('subscriptions'));
  const unreadCounts = this.use(store.state$.get('unreadCounts'));
  const totalUnreadCounts = this.useMemo(
    () => unreadCounts.reduce((totalCount, { count }) => totalCount + count, 0),
    [unreadCounts],
  );
  const subscriptionTree = this.useMemo(
    () => SubscriptionTree({ subscriptions, unreadCounts, url: scene.url }),
    [subscriptions, unreadCounts, scene.url],
  );
  const reload = async () => {
    setIsSyncing(true);
    try {
      await store.dispatch(reloadSubscriptions());
    } finally {
      setIsSyncing(false);
    }
  };

  this.useEffect(() => {
    if (lastSynced < 0) {
      reload();
    }
  }, [lastSynced]);

  return html`
    <div class="Sidenav" inert=${isSyncing}>
      <header class="Sidenav-Header">
        <div class="Sidenav-Toolbar" role="toolbar">
          <div class="Sidenav-Toolbar-Item">
            <button
              aria-label="Reload subscriptions"
              class="Button solid default"
              disabled=${isSyncing}
              title="Reload subscriptions"
              type="button"
              @click=${reload}
            >
              <div aria-hidden="true" class="Button-icon EmojiIcon">
                <span class="EmojiIcon-glyph">🔄</span>
              </div>
            </button>
          </div>
          <div class="Sidenav-Toolbar-Spacer"></div>
          <div class="Sidenav-Toolbar-Item">
            <button
              aria-label="Search subscriptions"
              class="Button solid default"
              title="Search subscriptions"
              type="button"
            >
              <div aria-hidden="true" class="Button-icon EmojiIcon">
                <span class="EmojiIcon-glyph">🔍︎</span>
              </div>
            </button>
          </div>
          <div class="Sidenav-Toolbar-Item">
            <button
              aria-label="Toggle sidebar"
              class="Button solid default"
              title="Toggle sidebar"
              type="button"
            >
              <div aria-hidden="true" class="Button-icon EmojiIcon">
                <span class="EmojiIcon-glyph">⬅️</span>
              </div>
            </button>
          </div>
        </div>
      </header>
      <div class="Sidenav-Main">
        <div class="SideMenu" role="menu">
          <div class="SideMenu-Group" role="group">
            <div class="SideMenu-Item">
              <a class="SideMenu-Item-Cell" href="#/all" role="menuitem">
                <div aria-hidden="true" class="SideMenu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">📚</span>
                </div>
                <div class="SideMenu-Item-label">All Feeds</div>
                <div class="SideMenu-Item-info Badge primary small">
                  ${totalUnreadCounts > 0 ? totalUnreadCounts : undefined}
                </div>
              </a>
            </div>
            <div class="SideMenu-Item">
              <a class="SideMenu-Item-Cell" href="#/subscribe" role="menuitem">
                <div aria-hidden="true" class="SideMenu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">🛜</span>
                </div>
                <div class="SideMenu-item-label">Subscribe Feeds</div>
              </a>
            </div>
          </div>
          <div class="SideMenu-Header">
            <div class="SideMenu-Header-label">Feeds</div>
            <div class="SideMenu-Header-info">
              <div class="Badge invert small">
                <${RelativeTime({ timeMillis: lastSynced })}>
              </div>
            </div>
            <button class="SideMenu-Header-action">
              <div class="SideMenu-Header-Action-icon PathIcon solid horizontal-dots"></div>
            </button>
          </div>
          <div class="SideMenu-Group" role="group">
            <${subscriptionTree}>
          </div>
          <div class="SideMenu-Group" role="group">
            <div class="SideMenu-Item" role="menuitem">
              <a class="SideMenu-Item-Cell" href="#/settings">
                <div aria-hidden=true" class="SideMenu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">⚙️</span>
                </div>
                <div class="SideMenu-Item-label">Settings</div>
              </a>
            </div>
            <div class="SideMenu-Item" role="menuitem">
              <a class="SideMenu-Item-Cell" href="#/about">
                <div aria-hidden="true" class="SideMenu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">ℹ️</span>
                </div>
                <div class="SideMenu-Item-label">About</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
});
