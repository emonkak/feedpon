import * as areEqual from 'fbjs/lib/areEqual';

import { Event, State } from 'messaging/types';

export default function reducer(state: State, event: Event): State {
    switch (event.type) {
        case 'ENTRIES_FETCHED':
            if (!areEqual(state.feed, event.feed)) {
                return state;
            }

            return {
                ...state,
                entries: event.entries,
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                ...state,
                subscriptions: event.subscriptions
            };

        case 'FEED_SELECTED':
            return {
                ...state,
                entries: [],
                feed: event.feed,
            };

        case 'FEED_UNSELECTED':
            return {
                ...state,
                entries: [],
                feed: null,
            };

        case 'NOTIFICATION_SENT':
            return {
                ...state,
                notifications: [...state.notifications, event.notification]
            };

        case 'NOTIFICATION_DISMISSED':
            return {
                ...state,
                notifications: state.notifications.filter(notification => notification.id !== event.id)
            };

        default:
            return state;
    }
}
