import React from 'react';

import { InstantNotification } from 'messaging/types';

interface InstantNotificationProps {
    instantNotification: InstantNotification;
}

const InstantNotificationComponent: React.SFC<InstantNotificationProps> = ({
    instantNotification
}) => {
    return (
        <div className="instant-notification">{instantNotification.message}</div>
    );
};

export default InstantNotificationComponent;
