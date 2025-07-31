import { component, type RenderContext, repeat } from 'barebind';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';
import { dismissNotification } from 'feedpon-messaging/notifications';

import { NotificationView } from './NotificationView.ts';

export interface NotificationStackProps {}

export function NotificationStack(
  {}: NotificationStackProps,
  context: RenderContext,
): unknown {
  const { notifications, onDismissNotification } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        notifications: state.notifications.items,
      }),
      mapDispatchToProps: bindActions({
        onDismissNotification: dismissNotification,
      }),
    }),
  );

  return context.html`
    <div class="notification-list">
      <${repeat({
        source: notifications,
        keySelector: (notification) => notification.id,
        valueSelector: (notification) =>
          component(NotificationView, {
            notification,
            onDismiss: onDismissNotification,
          }),
      })}>
    </div>
  `;
}
