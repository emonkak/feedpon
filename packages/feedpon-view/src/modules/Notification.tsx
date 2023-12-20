import React, { useEffect } from 'react';
import classnames from 'classnames';

import type { Notification } from 'feedpon-messaging';
import useEvent from '../hooks/useEvent';

interface NotificationProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

export default function NotificationComponent({
  notification,
  onDismiss,
}: NotificationProps) {
  const handleClose = useEvent((event: React.MouseEvent<any>) => {
    event.preventDefault();

    onDismiss(notification.id);
  });

  useEffect(() => {
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

  return (
    <div
      className={classnames('notification', {
        'notification-negative': notification.kind === 'negative',
        'notification-positive': notification.kind === 'positive',
      })}
    >
      <div className="notification-icon">
        <i
          className={classnames('icon', 'icon-24', {
            'icon-info': notification.kind === 'default',
            'icon-checked': notification.kind === 'positive',
            'icon-warning': notification.kind === 'negative',
          })}
        />
      </div>
      <div className="notification-content">
        <span className="u-text-truncate" title={notification.message}>
          {notification.message}
        </span>
      </div>
      <a className="notification-icon link-soft" href="#" onClick={handleClose}>
        <i className="icon icon-16 icon-delete" />
      </a>
    </div>
  );
}
