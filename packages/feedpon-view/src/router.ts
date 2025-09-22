import {
  type HistoryNavigator,
  Router,
  route,
  wildcard,
} from 'barebind/extras/router';
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
  route([''], (_args, _url, { store }) => DashboardPage({ store })),
  route(['about'], (_args, _url, { navigator, store }) =>
    AboutPage({ navigator, store }),
  ),
  route(
    ['categories'],
    (_args, _url, { navigator, store }) => CategoriesPage({ navigator, store }),
    [
      route([wildcard], ([label], _url, { navigator, store }) =>
        CategoriesPage({ label, navigator, store }),
      ),
    ],
  ),
  route(['kitchensink'], () => KitchensinkPage({})),
  route(
    ['search'],
    (_args, _url, { navigator, store }) => SearchPage({ navigator, store }),
    [
      route([wildcard], ([query], _url, { navigator, store }) =>
        SearchPage({ navigator, query, store }),
      ),
    ],
  ),
  route(['settings'], null, [
    route(['appearance'], (_args, url, { store }) =>
      SettingsPage({
        url,
        children: AppearanceSettings({ store }),
      }),
    ),
    route(['stream'], (_args, url, { store }) =>
      SettingsPage({
        url,
        children: StreamSettings({ store }),
      }),
    ),
  ]),
  route(['streams', wildcard], ([streamId], _url, { store }) =>
    StreamPage({ store, streamId }),
  ),
]);
