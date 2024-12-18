import type { Event } from '../index';

const DEFAULT_DISMISS_AFTER = 1000;

export function showOSDMessage(
  body: string,
  closeAfter: number = DEFAULT_DISMISS_AFTER,
): Event {
  return {
    type: 'OSD_MESSAGE_SENT',
    message: {
      body,
      closeAfter,
    },
  };
}

export function closeOSD(): Event {
  return {
    type: 'OSD_CLOSED',
  };
}
