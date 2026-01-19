import {
  decoded,
  type HistoryNavigator,
  Router,
  route,
} from 'barebind/addons/router';
import type { AppStore } from 'feedpon-store';
import { AboutPage } from './about/AboutPage.ts';
import { CategoriesPage } from './category/CategoriesPage.ts';
import { DashboardPage } from './dashboard/DashboardPage.ts';
import { KitchensinkPage } from './kitchensink/KitchensinkPage.ts';
import { SearchPage } from './search/SearchPage.ts';
import { AppearanceSettings } from './settings/AppearanceSettings.ts';
import { SettingsPage } from './settings/SettingsPage.ts';
import { StreamSettings } from './settings/StreamSettings.ts';
import { StreamPage } from './stream/StreamPage.ts';

export interface RouterState {
  navigator: HistoryNavigator;
  store: AppStore;
}

export const router = new Router<unknown, RouterState>([
  route([''], (_captures, _url, { store }) => DashboardPage({ store })),
  route(['about'], (_captures, _url, { navigator, store }) =>
    AboutPage({ navigator, store }),
  ),
  route(
    ['categories'],
    (_captures, _url, { navigator, store }) =>
      CategoriesPage({ navigator, store }),
    [
      route([decoded], ([label], _url, { navigator, store }) =>
        CategoriesPage({ label, navigator, store }),
      ),
    ],
  ),
  route(['kitchensink'], () => KitchensinkPage({})),
  route(
    ['search'],
    (_captures, _url, { navigator, store }) => SearchPage({ navigator, store }),
    [
      route([decoded], ([query], _url, { navigator, store }) =>
        SearchPage({ navigator, query, store }),
      ),
    ],
  ),
  route(['settings'], null, [
    route(['appearance'], (_captures, url, { store }) =>
      SettingsPage({
        url,
        children: AppearanceSettings({ store }),
      }),
    ),
    route(['stream'], (_captures, url, { store }) =>
      SettingsPage({
        url,
        children: StreamSettings({ store }),
      }),
    ),
  ]),
  route(['streams', decoded], ([streamId], _url, { store }) =>
    StreamPage({ store, streamId }),
  ),
]);
