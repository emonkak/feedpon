import { type Component, component } from '@emonkak/ebit/directives.js';
import {
  type LocationActions,
  Router,
  route,
  wildcard,
} from '@emonkak/ebit/router.js';
import type { Store } from 'feedpon-messaging';

import { AboutPage } from './about/AboutPage';
import { CategoriesPage } from './category/CategoriesPage';
import { DashboardPage } from './dashboard/DashboardPage';
import { KitchensinkPage } from './kitchensink/KitchensinkPage';
import { SearchPage } from './search/SearchPage';
import { KeyboardSettings } from './settings/KeyboardSettings';
import { SettingsPage } from './settings/SettingsPage';
import { SiteinfoSettings } from './settings/SiteinfoSettings';
import { StreamSettings } from './settings/StreamSettings';
import { TrackingUrlSettings } from './settings/TrackingUrlSettings';
import { UISettings } from './settings/UISettings';
import { UrlReplacementSettings } from './settings/UrlReplacementSettings';
import { StreamPage } from './stream/StreamPage';

export interface RouterState {
  locationActions: LocationActions;
  store: Store;
}

export const router = new Router<Component<any, any, any>, RouterState>([
  route([''], () => component(DashboardPage, {})),
  route(
    ['about'],
    (_args, _url, { locationActions }) =>
      component(AboutPage, { locationActions }) as Component<any, any, any>,
  ),
  route(
    ['categories'],
    (_args, _url, { locationActions }) =>
      component(CategoriesPage, { locationActions }) as Component<
        any,
        any,
        any
      >,
    [
      route(
        [wildcard],
        ([label], _url, { locationActions }) =>
          component(CategoriesPage, { label, locationActions }) as Component<
            any,
            any,
            any
          >,
      ),
    ],
  ),
  route(['kitchensink'], () => component(KitchensinkPage, {})),
  route(
    ['search'],
    (_args, _url, { locationActions }) =>
      component(SearchPage, { locationActions }) as Component<any, any, any>,
    [
      route(
        [wildcard],
        ([query], _url, { locationActions }) =>
          component(SearchPage, {
            locationActions,
            defaultQuery: query,
          }) as Component<any, any, any>,
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
  route(
    ['streams', wildcard],
    ([streamId]) =>
      component(StreamPage, { streamId }) as Component<any, any, any>,
  ),
]);
