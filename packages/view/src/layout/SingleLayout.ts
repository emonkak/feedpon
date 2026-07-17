import { AppStore } from '@feedpon/model';
import { createComponent, html } from 'barebind';

import { NotificationStack } from '../notification/NotificationStack.ts';
import { OsdStack } from '../osd/OsdStack.ts';

export interface SingleLayoutProps {
  child?: unknown;
}

export const SingleLayout = createComponent<SingleLayoutProps>(
  function SingleLayout({ child }) {
    const { state$ } = this.use(AppStore);
    const authenticating = this.use(state$.get('authenticating'));

    return html`
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
          ? html`<i class="icon icon-48 icon-spinner animation-rotating"></i>`
          : null
      }>
    </div>
  `;
  },
);
