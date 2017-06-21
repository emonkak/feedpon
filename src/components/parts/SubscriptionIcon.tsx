import React from 'react';
import classnames from 'classnames';

interface SubscriptionIconProps {
    iconUrl: string;
    title: string;
    className?: string;
}

const SubscriptionIcon: React.SFC<SubscriptionIconProps> = ({
    className,
    iconUrl,
    title 
}) => {
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

export default SubscriptionIcon;
