import { History } from 'react-router/lib/History';

import { Action } from '../messaging/types';
import { HISTORY } from '../messaging/actions';

export default function historyMiddleware(history: History): (action: Action, next: (action: Action) => void) => void {
    return (action, next) => {
        switch (action.type) {
            case HISTORY.PUSH:
                history.push(action.path);
                break;

            case HISTORY.REPLACE:
                history.replace(action.path);
                break;

            case HISTORY.GO:
                history.go(action.n);
                break;

            case HISTORY.GO_BACK:
                history.goBack();
                break;

            case HISTORY.GO_FORWARD:
                history.goForward();
                break;

            default:
                next(action);
                break;
        }
    };
}
