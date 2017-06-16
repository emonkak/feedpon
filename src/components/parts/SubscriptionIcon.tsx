import React, { PureComponent } from 'react';
import classnames from 'classnames';

interface SubscriptionIconProps {
    iconUrl: string;
    title: string;
    className?: string;
}

export default class SubscriptionIcon extends PureComponent<SubscriptionIconProps, {}> {
    render() {
        const { className, iconUrl, title } = this.props;

        if (iconUrl) {
            return (
                <img
                    className={className}
                    alt={title}
                    src={iconUrl}
                    width={16}
                    height={16} />
            );
        } else {
            return (
                <i className={classnames('icon icon-16 icon-file', className)} />
            );
        }
    }
}
