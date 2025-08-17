import {
  type HistoryNavigator,
  Router,
  route,
  wildcard,
} from 'barebind/extras/router';
import type { Store } from 'feedpon-messaging';

import { AboutPage } from './about/AboutPage.ts';
import { CategoriesPage } from './category/CategoriesPage.ts';
import { DashboardPage } from './dashboard/DashboardPage.ts';
import { KitchensinkPage } from './kitchensink/KitchensinkPage.ts';
import { SearchPage } from './search/SearchPage.ts';
import { KeyboardSettings } from './settings/KeyboardSettings.ts';
import { SettingsPage } from './settings/SettingsPage.ts';
import { SiteinfoSettings } from './settings/SiteinfoSettings.ts';
import { StreamSettings } from './settings/StreamSettings.ts';
import { TrackingUrlSettings } from './settings/TrackingUrlSettings.ts';
import { UISettings } from './settings/UISettings.ts';
import { UrlReplacementSettings } from './settings/UrlReplacementSettings.ts';
import { StreamPage } from './stream/StreamPage.ts';

export interface RouterState {
  navigator: HistoryNavigator;
  store: Store;
}

export const router = new Router<unknown, RouterState>([
  route([''], () => DashboardPage({})),
  route(['about'], (_args, _url, { navigator }) => AboutPage({ navigator })),
  route(
    ['categories'],
    (_args, _url, { navigator }) => CategoriesPage({ navigator }),
    [
      route([wildcard], ([label], _url, { navigator }) =>
        CategoriesPage({ label, navigator }),
      ),
    ],
  ),
  route(['kitchensink'], () => KitchensinkPage({})),
  route(['search'], (_args, _url, { navigator }) => SearchPage({ navigator }), [
    route([wildcard], ([query], _url, { navigator }) =>
      SearchPage({
        navigator,
        defaultQuery: query,
      }),
    ),
  ]),
  route(['settings'], null, [
    route(['keyboard'], (_args, url) =>
      SettingsPage({
        url,
        children: KeyboardSettings({}),
      }),
    ),
    route(['siteinfo'], (_args, url) =>
      SettingsPage({
        url,
        children: SiteinfoSettings({}),
      }),
    ),
    route(['stream'], (_args, url) =>
      SettingsPage({
        url,
        children: StreamSettings({}),
      }),
    ),
    route(['tracking_url'], (_args, url) =>
      SettingsPage({
        url,
        children: TrackingUrlSettings({}),
      }),
    ),
    route(['ui'], (_args, url) =>
      SettingsPage({
        url,
        children: UISettings({}),
      }),
    ),
    route(['url_replacement'], (_args, url) =>
      SettingsPage({
        url,
        children: UrlReplacementSettings({}),
      }),
    ),
  ]),
  route(['streams', wildcard], ([streamId]) => StreamPage({ streamId })),
]);
