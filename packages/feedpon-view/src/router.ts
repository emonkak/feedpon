import type { Bindable } from 'barebind';
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

export interface RouterContext {
  navigator: HistoryNavigator;
  store: AppStore;
}

export const router = new Router<Bindable<unknown>>([
  route([''], () => DashboardPage({})),
  route(['about'], () => AboutPage({})),
  route(['categories'], () => CategoriesPage({}), [
    route([decoded], ([label]) => CategoriesPage({ label })),
  ]),
  route(['kitchensink'], () => KitchensinkPage({})),
  route(['search'], () => SearchPage({}), [
    route([decoded], ([query]) => SearchPage({ query })),
  ]),
  route(['settings'], null, [
    route(['appearance'], (_captures, url) =>
      SettingsPage({
        url,
        children: AppearanceSettings({}),
      }),
    ),
    route(['stream'], (_captures, url) =>
      SettingsPage({
        url,
        children: StreamSettings({}),
      }),
    ),
  ]),
  route(['streams', decoded], ([streamId]) => StreamPage({ streamId })),
]);
