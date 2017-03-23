import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

export default class Notification extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        isReversed: PropTypes.bool.isRequired,
        kind: PropTypes.oneOf(['default', 'positive', 'negative']),
        onClose: PropTypes.func,
    };

    static defaultProps = {
        isReversed: false
    };

    handleClose(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onClose } = this.props;

        if (onClose) {
            onClose(event);
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
