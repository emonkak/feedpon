import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { getStoreHook } from 'feedpon-flux/ebit';
import type { State } from 'feedpon-messaging';

import { component, optional } from '@emonkak/ebit/directives.js';
import { NotificationStack } from '../notification/NotificationStack';
import { OSD } from '../osd/OSD';

export interface SingleLayoutProps {
  child?: unknown;
}

export function SingleLayout(
  { child }: SingleLayoutProps,
  context: RenderContext,
): TemplateResult {
  const { isLoading } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        isLoading: state.backend.isLoading,
      }),
    }),
  );

  return context.html`
    <div class="l-main">
      <div class="l-notifications">
        <${component(NotificationStack, {})}>
      </div>
      <div class="l-osd">
        <${component(OSD, {})}>
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
