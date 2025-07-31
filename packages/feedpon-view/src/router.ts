import { component } from 'barebind';
import {
  type HistoryNavigator,
  Router,
  route,
  wildcard,
} from 'barebind/extensions/router';
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
  route([''], () => component(DashboardPage, {})),
  route(['about'], (_args, _url, { navigator }) =>
    component(AboutPage, { navigator }),
  ),
  route(
    ['categories'],
    (_args, _url, { navigator }) => component(CategoriesPage, { navigator }),
    [
      route([wildcard], ([label], _url, { navigator }) =>
        component(CategoriesPage, { label, navigator }),
      ),
    ],
  ),
  route(['kitchensink'], () => component(KitchensinkPage, {})),
  route(
    ['search'],
    (_args, _url, { navigator }) => component(SearchPage, { navigator }),
    [
      route([wildcard], ([query], _url, { navigator }) =>
        component(SearchPage, {
          navigator,
          defaultQuery: query,
        }),
      ),
    ],
  ),
  route(['settings'], null, [
    route(['keyboard'], (_args, url) =>
      component(SettingsPage, {
        url,
        children: component(KeyboardSettings, {}),
      }),
    ),
    route(['siteinfo'], (_args, url) =>
      component(SettingsPage, {
        url,
        children: component(SiteinfoSettings, {}),
      }),
    ),
    route(['stream'], (_args, url) =>
      component(SettingsPage, {
        url,
        children: component(StreamSettings, {}),
      }),
    ),
    route(['tracking_url'], (_args, url) =>
      component(SettingsPage, {
        url,
        children: component(TrackingUrlSettings, {}),
      }),
    ),
    route(['ui'], (_args, url) =>
      component(SettingsPage, {
        url,
        children: component(UISettings, {}),
      }),
    ),
    route(['url_replacement'], (_args, url) =>
      component(SettingsPage, {
        url,
        children: component(UrlReplacementSettings, {}),
      }),
    ),
  ]),
  route(['streams', wildcard], ([streamId]) =>
    component(StreamPage, { streamId }),
  ),
]);
