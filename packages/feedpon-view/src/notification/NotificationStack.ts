import { createComponent, type RenderContext, Repeat } from 'barebind';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';
import { dismissNotification } from 'feedpon-messaging/notifications';

import { NotificationView } from './NotificationView.ts';

export interface NotificationStackProps {}

export const NotificationStack = createComponent(function NotificationStack(
  {}: NotificationStackProps,
  $: RenderContext,
): unknown {
  const { notifications, onDismissNotification } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        notifications: state.notifications.items,
      }),
      mapDispatchToProps: bindActions({
        onDismissNotification: dismissNotification,
      }),
    }),
  );

  return $.html`
    <div class="notification-list">
      <${Repeat({
        source: notifications,
        keySelector: (notification) => notification.id,
        valueSelector: (notification) =>
          NotificationView({
            notification,
            onDismiss: onDismissNotification,
          }),
      })}>
    </div>
  `;
});
