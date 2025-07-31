import { component, type RenderContext } from 'barebind';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';

import { NotificationStack } from '../notification/NotificationStack.ts';
import { OSD } from '../osd/OSD.ts';

export interface SingleLayoutProps {
  child?: unknown;
}

export function SingleLayout(
  { child }: SingleLayoutProps,
  context: RenderContext,
): unknown {
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
      <${
        isLoading
          ? context.html`<i class="icon icon-48 icon-spinner animation-rotating"></i>`
          : null
      }>
    </div>
  `;
}
