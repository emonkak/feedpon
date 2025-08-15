import type { RenderContext } from 'barebind';
import type { Notification } from 'feedpon-messaging';

interface NotificationViewProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

export function NotificationView(
  { notification, onDismiss }: NotificationViewProps,
  context: RenderContext,
): unknown {
  const handleClose = context.useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      onDismiss(notification.id);
    },
    [onDismiss],
  );

  context.useEffect(() => {
    if (notification.dismissAfter <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, notification.dismissAfter);

    return () => {
      clearTimeout(timer);
    };
  }, [notification]);

  return context.html`
    <div
      :class=${{
        _: 'notification',
        'notification-negative': notification.kind === 'negative',
        'notification-positive': notification.kind === 'positive',
      }}
    >
      <div class="notification-icon">
        <i :class=${{
          _: 'icon icon-24',
          'icon-info': notification.kind === 'default',
          'icon-checked': notification.kind === 'positive',
          'icon-warning': notification.kind === 'negative',
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
}
