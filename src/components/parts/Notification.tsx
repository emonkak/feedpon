import * as React from 'react';
import * as classnames from 'classnames';

export default class Notification extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        kind: React.PropTypes.oneOf(['default', 'positive', 'negative']),
        onClose: React.PropTypes.func,
    };

    handleClose(event: React.MouseEvent<any>) {
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
        const { children, kind } = this.props;

        const className = classnames('notification', {
            'notification-positive': kind === 'positive',
            'notification-negative': kind === 'negative',
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
