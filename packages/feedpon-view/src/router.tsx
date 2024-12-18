import { type Component, Either, component } from '@emonkak/ebit/directives.js';
import {
  type LocationActions,
  Router,
  route,
  wildcard,
} from '@emonkak/ebit/router.js';
import type { Store } from 'feedpon-messaging';
import React from 'react';

import { StoreContext } from 'feedpon-flux/react';
import { AboutPage } from './about/AboutPage';
import { CategoriesPage } from './category/CategoriesPage';
import {
  type ReactElement,
  reactElement,
} from './common/directives/reactElement';
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

export const router = new Router<
  Either<ReactElement, Component<any, any, any>>,
  RouterState
>([
  route([''], (_args, _url, { store }) =>
    Either.left(reactElement(wrapStoreContext(<DashboardPage />, store))),
  ),
  route(['about'], (_args, _url, { locationActions }) =>
    Either.right(
      component(AboutPage, { locationActions }) as Component<any, any, any>,
    ),
  ),
  route(
    ['categories'],
    (_args, _url, { locationActions, store }) =>
      Either.left(
        reactElement(
          wrapStoreContext(
            <CategoriesPage locationActions={locationActions} />,
            store,
          ),
        ),
      ),
    [
      route([wildcard], ([label], _url, { locationActions, store }) =>
        Either.left(
          reactElement(
            wrapStoreContext(
              <CategoriesPage
                label={label}
                locationActions={locationActions}
              />,
              store,
            ),
          ),
        ),
      ),
    ],
  ),
  route(['kitchensink'], () => Either.right(component(KitchensinkPage, {}))),
  route(
    ['search'],
    (_args, _url, { locationActions }) =>
      Either.right(
        component(SearchPage, { locationActions }) as Component<any, any, any>,
      ),
    [
      route([wildcard], ([query], _url, { locationActions }) =>
        Either.right(
          component(SearchPage, {
            locationActions,
            defaultQuery: query,
          }) as Component<any, any, any>,
        ),
      ),
    ],
  ),
  route(
    ['settings'],
    (_args, url, { locationActions, store }) =>
      Either.left(
        reactElement(
          wrapStoreContext(
            <SettingsPage locationActions={locationActions} url={url}>
              <UISettings />
            </SettingsPage>,
            store,
          ),
        ),
      ),
    [
      route(['keyboard'], (_args, url, { locationActions, store }) =>
        Either.left(
          reactElement(
            wrapStoreContext(
              <SettingsPage locationActions={locationActions} url={url}>
                <KeyboardSettings />
              </SettingsPage>,
              store,
            ),
          ),
        ),
      ),
      route(['siteinfo'], (_args, url, { locationActions, store }) =>
        Either.left(
          reactElement(
            wrapStoreContext(
              <SettingsPage locationActions={locationActions} url={url}>
                <SiteinfoSettings />
              </SettingsPage>,
              store,
            ),
          ),
        ),
      ),
      route(['stream'], (_args, url, { locationActions, store }) =>
        Either.left(
          reactElement(
            wrapStoreContext(
              <SettingsPage locationActions={locationActions} url={url}>
                <StreamSettings />
              </SettingsPage>,
              store,
            ),
          ),
        ),
      ),
      route(['tracking_url'], (_args, url, { locationActions, store }) =>
        Either.left(
          reactElement(
            wrapStoreContext(
              <SettingsPage locationActions={locationActions} url={url}>
                <TrackingUrlSettings />
              </SettingsPage>,
              store,
            ),
          ),
        ),
      ),
      route(['url_replacement'], (_args, url, { locationActions, store }) =>
        Either.left(
          reactElement(
            wrapStoreContext(
              <SettingsPage locationActions={locationActions} url={url}>
                <UrlReplacementSettings />
              </SettingsPage>,
              store,
            ),
          ),
        ),
      ),
      route(['ui'], (_args, url, { locationActions, store }) =>
        Either.left(
          reactElement(
            wrapStoreContext(
              <SettingsPage locationActions={locationActions} url={url}>
                <UISettings />
              </SettingsPage>,
              store,
            ),
          ),
        ),
      ),
    ],
  ),
  route(['streams', wildcard], ([streamId]) =>
    Either.right(
      component(StreamPage, { streamId }) as Component<any, any, any>,
    ),
  ),
]);

function wrapStoreContext(
  element: React.ReactElement,
  store: Store,
): React.ReactElement {
  return <StoreContext.Provider value={store}>{element}</StoreContext.Provider>;
}
