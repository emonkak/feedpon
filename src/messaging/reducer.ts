import { Action, State } from 'messaging/types';

export default function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'FETCH_SUBSCRIPTIONS':
            return {
                ...state,
                subscriptions: action.subscriptions
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
