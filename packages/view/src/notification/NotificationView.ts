import type { Notification } from '@feedpon/model';
import { createComponent, html } from 'barebind';

interface NotificationViewProps {
  notification: Notification;
  dismissNotification: (id: string) => void;
}

export const NotificationView = createComponent<NotificationViewProps>(
  function NotificationView({ notification, dismissNotification }) {
    const handleClose = this.useCallback(
      (event: MouseEvent) => {
        event.preventDefault();
        dismissNotification(notification.id);
      },
      [dismissNotification],
    );

    this.useEffect(() => {
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

    return html`
      <div
        class=${{
          notification: true,
          'notification-negative': notification.type === 'negative',
          'notification-positive': notification.type === 'positive',
        }}
      >
        <div class="notification-icon">
          <i class=${{
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
  },
);
