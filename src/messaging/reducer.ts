import { Action, State } from 'messaging/types';

export default function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'FETCH_SUBSCRIPTIONS':
            return { ...state, subscriptions: action.subscriptions };

        default:
            return state;
    }
}
