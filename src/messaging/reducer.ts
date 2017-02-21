import * as areEqual from 'fbjs/lib/areEqual';

import { Action, State } from 'messaging/types';

export default function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'FETCH_ENTRIES':
            if (!areEqual(state.feed, action.feed)) {
                return state;
            }

            return {
                ...state,
                entries: action.entries,
            };

        case 'FETCH_SUBSCRIPTIONS':
            return {
                ...state,
                subscriptions: action.subscriptions
            };

        case 'SELECT_FEED':
            return {
                ...state,
                entries: [],
                feed: action.feed,
                pageTitle: action.feed.title,
            };

        case 'UNSELECT_FEED':
            return {
                ...state,
                entries: [],
                feed: null,
            };

        case 'SEND_NOTIFICATION':
            return {
                ...state,
                notifications: [...state.notifications, action.notification]
            };

        case 'DISMISS_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(notification => notification.id !== action.id)
            };

        default:
            return state;
    }
}
