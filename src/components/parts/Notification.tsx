import React, { PureComponent } from 'react';
import classnames from 'classnames';

import { Notification } from 'messaging/types';

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

    componentDidMount() {
        const { notification, onDismiss } = this.props;

        if (notification.dismissAfter > 0) {
            this.timer = setTimeout(() => {
                onDismiss(notification.id);
                this.timer = null;
            }, notification.dismissAfter);
        }
    }

    componentWillUnmount() {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    handleClose(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { onDismiss, notification } = this.props;

        onDismiss(notification.id);
    }

    render() {
        const { notification } = this.props;

        const notificationClassName = classnames('notification', {
            'notification-negative': notification.kind === 'negative',
            'notification-positive': notification.kind === 'positive'
        });

        const iconClassName = classnames('icon', 'icon-24', {
            'icon-info': notification.kind === 'default',
            'icon-checked': notification.kind === 'positive',
            'icon-warning': notification.kind === 'negative'
        });

        return (
            <div className={notificationClassName}>
                <div className="notification-icon">
                    <i className={iconClassName} />
                </div>
                <div className="notification-content">
                    <span className="u-text-truncate" title={notification.message}>{notification.message}</span>
                </div>
                <a className="notification-icon link-soft" href="#" onClick={this.handleClose}>
                    <i className="icon icon-16 icon-delete" />
                </a>
            </div>
        );
    }
}
