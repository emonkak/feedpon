import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, keyedList } from '@emonkak/ebit/directives.js';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit.ts';
import type { State } from 'feedpon-messaging';
import { dismissNotification } from 'feedpon-messaging/notifications';
import { NotificationView } from './NotificationView.ts';

export interface NotificationStackProps {}

export function NotificationStack(
  {}: NotificationStackProps,
  context: RenderContext,
): TemplateResult {
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
      <${keyedList(
        notifications,
        (notification) => notification.id,
        (notification) =>
          component(NotificationView, {
            notification,
            onDismiss: onDismissNotification,
          }),
      )}>
    </div>
  `;
}
