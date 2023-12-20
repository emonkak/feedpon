import React from 'react';

import type { InstantNotification } from 'feedpon-messaging';

interface InstantNotificationProps {
  instantNotification: InstantNotification;
}

export default function InstantNotificationComponent({
  instantNotification,
}: InstantNotificationProps) {
  return (
    <div className="instant-notification">{instantNotification.message}</div>
  );
}
