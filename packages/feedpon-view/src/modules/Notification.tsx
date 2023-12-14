import React, { PureComponent } from 'react';
import classnames from 'classnames';

import type { Notification } from 'feedpon-messaging';

interface NotificationProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

export default class NotificationComponent extends PureComponent<NotificationProps> {
  timer: number | null = null;

  constructor(props: NotificationProps) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
  }

  override componentDidMount() {
    const { notification, onDismiss } = this.props;

    if (notification.dismissAfter > 0) {
      this.timer = window.setTimeout(() => {
        onDismiss(notification.id);
        this.timer = null;
      }, notification.dismissAfter);
    }
  }

  override componentWillUnmount() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  handleClose(event: React.MouseEvent<any>) {
    event.preventDefault();

    const { onDismiss, notification } = this.props;

    onDismiss(notification.id);
  }

  override render() {
    const { notification } = this.props;

    const notificationClassName = classnames('notification', {
      'notification-negative': notification.kind === 'negative',
      'notification-positive': notification.kind === 'positive',
    });

    const iconClassName = classnames('icon', 'icon-24', {
      'icon-info': notification.kind === 'default',
      'icon-checked': notification.kind === 'positive',
      'icon-warning': notification.kind === 'negative',
    });

    return (
      <div className={notificationClassName}>
        <div className="notification-icon">
          <i className={iconClassName} />
        </div>
        <div className="notification-content">
          <span className="u-text-truncate" title={notification.message}>
            {notification.message}
          </span>
        </div>
        <a
          className="notification-icon link-soft"
          href="#"
          onClick={this.handleClose}
        >
          <i className="icon icon-16 icon-delete" />
        </a>
      </div>
    );
  }
}
