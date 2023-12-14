import React from 'react';

import type { InstantNotification } from 'feedpon-messaging';

interface InstantNotificationProps {
    instantNotification: InstantNotification;
}

const InstantNotificationComponent: React.FC<InstantNotificationProps> = ({
    instantNotification
}) => {
    return (
        <div className="instant-notification">{instantNotification.message}</div>
    );
};

export default InstantNotificationComponent;
