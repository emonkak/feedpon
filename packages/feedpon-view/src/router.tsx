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
import { AboutPage } from './containers/AboutPage';
import { CategoriesPage } from './containers/CategoriesPage';
import { DashboardPage } from './containers/DashboardPage';
import { KeyboardSettings } from './containers/KeyboardSettings';
import { KitchenSinkPage } from './containers/KitchenSinkPage';
import { SearchPage } from './containers/SearchPage';
import { SettingsPage } from './containers/SettingsPage';
import { SiteinfoSettings } from './containers/SiteinfoSettings';
import { StreamPage } from './containers/StreamPage';
import { StreamSettings } from './containers/StreamSettings';
import { TrackingUrlSettings } from './containers/TrackingUrlSettings';
import { UISettings } from './containers/UISettings';
import { UrlReplacementSettings } from './containers/UrlReplacementSettings';
import { type ReactElement, reactElement } from './directives/reactElement';

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
  route(['about'], (_args, _url, { locationActions, store }) =>
    Either.left(
      reactElement(
        wrapStoreContext(
          <AboutPage locationActions={locationActions} />,
          store,
        ),
      ),
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
  route(['kitchensink'], (_args, _url, { store }) =>
    Either.left(reactElement(wrapStoreContext(<KitchenSinkPage />, store))),
  ),
  route(
    ['search'],
    (_args, _url, { locationActions, store }) =>
      Either.left(
        reactElement(
          wrapStoreContext(
            <SearchPage locationActions={locationActions} />,
            store,
          ),
        ),
      ),
    [
      route([wildcard], ([query], _url, { locationActions, store }) =>
        Either.left(
          reactElement(
            wrapStoreContext(
              <SearchPage locationActions={locationActions} query={query} />,
              store,
            ),
          ),
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
    Either.right(component(StreamPage, { streamId })),
  ),
]);

function wrapStoreContext(
  element: React.ReactElement,
  store: Store,
): React.ReactElement {
  return <StoreContext.Provider value={store}>{element}</StoreContext.Provider>;
}
