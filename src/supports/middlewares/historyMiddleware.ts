import { History } from 'react-router/lib/routerHistory';

export default function historyMiddleware(history: History): (action: any, next: (action: any) => void) => void {
    return (action, next) => {
        switch (action.type) {
            case 'PUSH_HISTORY':
                history.push(action.path);
                break;

            case 'REPLACE_HISTORY':
                history.replace(action.path);
                break;

            case 'GO_HISTORY':
                history.go(action.n);
                break;

            case 'GO_BACK_HISTORY':
                history.goBack();
                break;

            case 'GO_FORWARD_HISTORY':
                history.goForward();
                break;

            default:
                next(action);
                break;
        }
    };
}
