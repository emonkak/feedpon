import type { Event, OSDState } from '../index';

export default function reducer(state: OSDState, event: Event): OSDState {
  switch (event.type) {
    case 'OSD_MESSAGE_SENT':
      return {
        ...state,
        message: event.message,
      };

    case 'OSD_CLOSED':
      return {
        ...state,
        message: null,
      };

    default:
      return state;
  }
}
