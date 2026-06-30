import type { Bindable } from 'barebind';
import {
  decoded,
  type NavigationAdapter,
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
  navigator: NavigationAdapter;
  store: AppStore;
}

export const router = new Router<Bindable>([
  route([''], () => DashboardPage({}) as unknown as Bindable),
  route(['about'], () => AboutPage({}) as unknown as Bindable),
  route(['categories'], () => CategoriesPage({}) as unknown as Bindable, [
    route(
      [decoded],
      ([label]) => CategoriesPage({ label }) as unknown as Bindable,
    ),
  ]),
  route(['kitchensink'], () => KitchensinkPage({}) as unknown as Bindable),
  route(['search'], () => SearchPage({}) as unknown as Bindable, [
    route([decoded], ([query]) => SearchPage({ query }) as unknown as Bindable),
  ]),
  route(['settings'], null, [
    route(
      ['appearance'],
      (_captures, url) =>
        SettingsPage({
          url,
          children: AppearanceSettings({}),
        }) as unknown as Bindable,
    ),
    route(
      ['stream'],
      (_captures, url) =>
        SettingsPage({
          url,
          children: StreamSettings({}),
        }) as unknown as Bindable,
    ),
  ]),
  route(
    ['streams', decoded],
    ([streamId]) => StreamPage({ streamId }) as unknown as Bindable,
  ),
]);
