import { createComponent, html } from 'barebind';
import type { NavigationScene } from 'barebind/addons/router';
import { reloadSubscriptions } from '../../state/actions.ts';
import { AppStore } from '../../state/store.ts';
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
        <menu class="Sidenav-Toolbar" role="toolbar">
          <li class="Sidenav-Toolbar-Item">
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
          </li>
          <li class="Sidenav-Toolbar-Spacer"></li>
          <li class="Sidenav-Toolbar-Item">
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
          </li>
          <li class="Sidenav-Toolbar-Item">
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
          </li>
        </menu>
      </header>
      <div class="Sidenav-Main">
        <div class="Sidenav-Menu" role="menu">
          <div class="Sidenav-Menu-Group" role="group">
            <div class="Sidenav-Menu-Item" role="menuitem">
              <a class="Sidenav-Menu-Item-Cell" href="#/all">
                <div aria-hidden="true" class="Sidenav-Menu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">📚</span>
                </div>
                <div class="Sidenav-Menu-Item-label">All Feeds</div>
                <div class="Sidenav-Menu-Item-info Badge primary small">
                  ${totalUnreadCounts > 0 ? totalUnreadCounts : undefined}
                </div>
              </a>
            </div>
            <div class="Sidenav-Menu-Item" role="menuitem">
              <a class="Sidenav-Menu-Item-Cell" href="#/subscribe">
                <div aria-hidden="true" class="Sidenav-Menu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">🛜</span>
                </div>
                <div class="Sidenav-Menu-item-label">Subscribe Feeds</div>
              </a>
            </div>
          </div>
          <div class="Sidenav-Menu-Group" role="group">
            <div class="Sidenav-Menu-Header" type="button">
              <div class="Sidenav-Menu-Header-Label">
                Subscriptions
              </div>
              <button class="Sidenav-Menu-Header-Action">
                <div class="Sidenav-Menu-Header-Action-icon PathIcon solid horizontal-dots"></div>
              </button>
            </div>
            <${subscriptionTree}>
          </div>
          <div class="Sidenav-Menu-Group" role="group">
            <div class="Sidenav-Menu-Item" role="menuitem">
              <a class="Sidenav-Menu-Item-Cell" href="#/settings">
                <div aria-hidden=true" class="Sidenav-Menu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">⚙️</span>
                </div>
                <div class="Sidenav-Menu-Item-label">Settings</div>
              </a>
            </div>
            <div class="Sidenav-Menu-Item" role="menuitem">
              <a class="Sidenav-Menu-Item-Cell" href="#/about">
                <div aria-hidden="true" class="Sidenav-Menu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">ℹ️</span>
                </div>
                <div class="Sidenav-Menu-Item-label">About</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
});
