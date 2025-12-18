import { createComponent, type RenderContext } from 'barebind';
import type { Notification } from 'feedpon-store';

interface NotificationViewProps {
  notification: Notification;
  dismissNotification: (id: string) => void;
}

export const NotificationView = createComponent(function NotificationView(
  { notification, dismissNotification }: NotificationViewProps,
  $: RenderContext,
): unknown {
  const handleClose = $.useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      dismissNotification(notification.id);
    },
    [dismissNotification],
  );

  $.useEffect(() => {
    if (notification.timeout <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      dismissNotification(notification.id);
    }, notification.timeout);

    return () => {
      clearTimeout(timer);
    };
  }, [notification]);

  return $.html`
    <div
      :class=${{
        notification: true,
        'notification-negative': notification.type === 'negative',
        'notification-positive': notification.type === 'positive',
      }}
    >
      <div class="notification-icon">
        <i :class=${{
          'icon icon-24': true,
          'icon-info': notification.type === 'info',
          'icon-checked': notification.type === 'positive',
          'icon-warning': notification.type === 'negative',
        }}></i>
      </div>
      <div class="notification-content">
        <span class="u-text-truncate" title=${notification.message}>
          ${notification.message}
        </span>
      </div>
      <a
        class="notification-icon link-soft"
        href="#"
        @click=${handleClose}
      >
        <i class="icon icon-16 icon-delete"></i>
      </a>
    </div>
  `;
});
