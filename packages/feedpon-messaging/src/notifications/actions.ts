import type { Event, NotificationKind } from '../index';

const DEFAULT_DISMISS_AFTER = 3000;

export function sendNotification(
  message: string,
  kind: NotificationKind,
  dismissAfter: number = DEFAULT_DISMISS_AFTER,
): Event {
  return {
    type: 'NOTIFICATION_SENT',
    notification: {
      id: Date.now(),
      message,
      kind,
      dismissAfter,
    },
  };
}

export function dismissNotification(id: number): Event {
  return {
    type: 'NOTIFICATION_DISMISSED',
    id,
  };
}
