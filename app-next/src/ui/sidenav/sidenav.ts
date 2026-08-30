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
  const subscriptionTree = this.useMemo(
    () => SubscriptionTree({ subscriptions, url: scene.url }),
    [subscriptions, scene.url],
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
        <menu class="Toolbar" role="toolbar">
          <li class="Toolbar-Item">
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
          <li class="Toolbar-Spacer"></li>
          <li class="Toolbar-Item">
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
          <li class="Toolbar-Item">
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
        <div class="SideMenu" role="menu">
          <div class="SideMenu-Section" role="group">
            <div class="SideMenu-Item" role="menuitem">
              <a class="SideMenu-Item-Cell" href="#/all">
                <div aria-hidden="true" class="SideMenu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">📚</span>
                </div>
                <div class="SideMenu-item-label">All Feeds</div>
              </a>
            </div>
            <div class="SideMenu-Item" role="menuitem">
              <a class="SideMenu-Item-Cell" href="#/subscribe">
                <div aria-hidden="true" class="SideMenu-Item-icon EmojiIcon">
                  <span class="EmojiIcon-glyph">🛜</span>
                </div>
                <div class="SideMenu-item-label">Subscribe Feeds</div>
              </a>
            </div>
          </div>
          <div class="SideMenu-Section" role="group">
            <div class="SideMenu-Header">
              <h1 class="SideMenu-Header-label">
                Subscriptions
              </h1>
              <button class="SideMenu-Header-action Button" type="button">
                <div class="Button-icon PathIcon shape preference"></div>
              </button>
            </div>
            <${subscriptionTree}>
          </div>
          <div class="SideMenu-Section" role="group">
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
