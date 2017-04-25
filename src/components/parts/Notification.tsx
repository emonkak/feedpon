import React, { PureComponent } from 'react';
import classnames from 'classnames';

import { NotificationKind } from 'messaging/types';

interface NotificationProps {
    children?: React.ReactNode;
    isReversed?: boolean;
    kind?: NotificationKind;
    onClose: () => void;
}

export default class Notification extends PureComponent<NotificationProps, {}> {
    static defaultProps = {
        isReversed: false,
        kind: 'default'
    };

    handleClose(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }
    }

    renderKindIcon() {
        const { kind } = this.props;

        const className = classnames('icon', 'icon-24', {
            'icon-info': kind === 'default',
            'icon-checked': kind === 'positive',
            'icon-warning': kind === 'negative',
        });

        return (
            <i className={className} />
        );
    }

    render() {
        const { children, kind, isReversed } = this.props;

        const className = classnames('notification', {
            'notification-negative': kind === 'negative',
            'notification-positive': kind === 'positive',
            'notification-reversed': isReversed
        });

        return (
            <div className={className}>
                <div className="notification-icon">
                    {this.renderKindIcon()}
                </div>
                <div className="notification-content">
                    {children}
                </div>
                <a className="notification-icon link-default" href="#" onClick={this.handleClose.bind(this)}>
                    <i className="icon icon-16 icon-delete" />
                </a>
            </div>
        );
    }
}
