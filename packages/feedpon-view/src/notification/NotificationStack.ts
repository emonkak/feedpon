import { createComponent, type RenderContext, Repeat } from 'barebind';
import { AppStore } from 'feedpon-store';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'state-management';
import { NotificationView } from './NotificationView.ts';

export interface NotificationStackProps {}

export const NotificationStack = createComponent(function NotificationStack(
  {}: NotificationStackProps,
  $: RenderContext,
): unknown {
  const { state$ } = $.use(AppStore);
  const notifications = $.use(state$.get('notifications'));
  const { dismissNotification } = $.use(
    BindActionCreators(AppStore, uiActions),
  );

  return $.html`
    <div class="notification-list">
      <${Repeat({
        source: notifications,
        keySelector: (notification) => notification.id,
        valueSelector: (notification) =>
          NotificationView({
            notification,
            dismissNotification,
          }),
      })}>
    </div>
  `;
});
