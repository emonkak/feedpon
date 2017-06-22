import React from 'react';

interface SubscriptionIconProps {
    iconUrl: string;
    title: string;
}

const SubscriptionIcon: React.SFC<SubscriptionIconProps> = ({
    iconUrl,
    title 
}) => {
    if (iconUrl) {
        return (
            <img
                className="u-vertical-middle u-object-fit-cover"
                alt={title}
                src={iconUrl}
                width={16}
                height={16} />
        );
    } else {
        return (
            <i className="icon icon-16 icon-file u-vertical-middle " />
        );
    }
}

export default SubscriptionIcon;
