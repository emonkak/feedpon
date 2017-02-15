import { History } from 'history';

import { PUSH, REPLACE, GO, GO_BACK, GO_FORWARD } from 'utils/middlewares/historyActions';

export default function historyMiddleware(history: History): (action: any, next: (action: any) => void) => void {
    return (action, next) => {
        switch (action.type) {
            case PUSH:
                history.push(action.path);
                break;

            case REPLACE:
                history.replace(action.path);
                break;

            case GO:
                history.go(action.n);
                break;

            case GO_BACK:
                history.goBack();
                break;

            case GO_FORWARD:
                history.goForward();
                break;

            default:
                next(action);
                break;
        }
    };
}
