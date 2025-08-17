import { createComponent, type RenderContext } from 'barebind';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';

import { NotificationStack } from '../notification/NotificationStack.ts';
import { OSD } from '../osd/OSD.ts';

export interface SingleLayoutProps {
  child?: unknown;
}

export const SingleLayout = createComponent(function SingleLayout(
  { child }: SingleLayoutProps,
  $: RenderContext,
): unknown {
  const { isLoading } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        isLoading: state.backend.isLoading,
      }),
    }),
  );

  return $.html`
    <div class="l-main">
      <div class="l-notifications">
        <${NotificationStack({})}>
      </div>
      <div class="l-osd">
        <${OSD({})}>
      </div>
      <${child}>
    </div>
    <div class="l-backdrop">
      <${
        isLoading
          ? $.html`<i class="icon icon-48 icon-spinner animation-rotating"></i>`
          : null
      }>
    </div>
  `;
});
