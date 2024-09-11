import React from 'react';

import type { InstantNotification } from 'feedpon-messaging';

interface InstantNotificationViewProps {
  instantNotification: InstantNotification;
}

export function InstantNotificationView({
  instantNotification,
}: InstantNotificationViewProps) {
  return (
    <div className="instant-notification">{instantNotification.message}</div>
  );
}
