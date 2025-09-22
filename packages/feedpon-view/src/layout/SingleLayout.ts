import { createComponent, type RenderContext } from 'barebind';
import { AppStore } from 'feedpon-store';

import { NotificationStack } from '../notification/NotificationStack.ts';
import { OsdStack } from '../osd/OsdStack.ts';

export interface SingleLayoutProps {
  child?: unknown;
}

export const SingleLayout = createComponent(function SingleLayout(
  { child }: SingleLayoutProps,
  $: RenderContext,
): unknown {
  const { state$ } = $.use(AppStore);
  const authenticating = $.use(state$.get('authenticating'));

  return $.html`
    <div class="l-main">
      <div class="l-notifications">
        <${NotificationStack({})}>
      </div>
      <div class="l-osd">
        <${OsdStack({})}>
      </div>
      <${child}>
    </div>
    <div class="l-backdrop">
      <${
        authenticating
          ? $.html`<i class="icon icon-48 icon-spinner animation-rotating"></i>`
          : null
      }>
    </div>
  `;
});
