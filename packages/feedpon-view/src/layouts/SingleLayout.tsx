import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { optional } from '@emonkak/ebit/directives.js';
import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import React from 'react';

import { InstantNotificationContainer } from '../containers/InstantNotificationContainer';
import { NotificationList } from '../containers/NotificationList';
import { reactElement } from '../directives/reactElement';

export interface SingleLayoutProps {
  child?: unknown;
}

export function SingleLayout(
  { child }: SingleLayoutProps,
  context: RenderContext,
): TemplateResult {
  const { isLoading } = useStore({
    mapStateToProps: (state: State) => ({
      isLoading: state.backend.isLoading,
    }),
  });

  return context.html`
    <div class="l-main">
      <div class="l-notifications">
        <${reactElement(<NotificationList />)}>
      </div>
      <div class="l-instant-notifications">
        <${reactElement(<InstantNotificationContainer />)}>
      </div>
      <${child}>
    </div>
    <div class="l-backdrop">
      ${optional(
        isLoading
          ? context.html`<i class="icon icon-48 icon-spinner animation-rotating"></i>`
          : null,
      )}
    </div>
  `;
}
