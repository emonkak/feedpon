import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import type { Store } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit';
import { StoreContext } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import React from 'react';

import { optional } from '@emonkak/ebit/directives.js';
import { reactElement } from '../common/directives/reactElement';
import { InstantNotificationContainer } from './InstantNotificationContainer';
import { NotificationList } from './NotificationList';

export interface SingleLayoutProps {
  child?: unknown;
}

export function SingleLayout(
  { child }: SingleLayoutProps,
  context: RenderContext,
): TemplateResult {
  const { store, isLoading } = context.use(
    getStoreHook({
      mapStoreToProps: (store) => ({ store }),
      mapStateToProps: (state: State) => ({
        isLoading: state.backend.isLoading,
      }),
    }),
  );

  return context.html`
    <div class="l-main">
      <div class="l-notifications">
        <${reactElement(wrapStoreContext(<NotificationList />, store))}>
      </div>
      <div class="l-instant-notifications">
        <${reactElement(wrapStoreContext(<InstantNotificationContainer />, store))}>
      </div>
      <${child}>
    </div>
    <div class="l-backdrop">
      <${optional(
        isLoading
          ? context.html`<i class="icon icon-48 icon-spinner animation-rotating"></i>`
          : null,
      )}>
    </div>
  `;
}

function wrapStoreContext(
  element: React.ReactElement,
  store: Store<unknown, unknown>,
): React.ReactElement {
  return <StoreContext.Provider value={store}>{element}</StoreContext.Provider>;
}
