import Store from '../supports/Store';
import { Action, State } from '../messaging/types';
import { RUN_IN_BACKGROUND } from '../messaging/actions';

export default function chromePortMiddleware(store: Store<Action, State>): (action: Action, next: (action: Action) => void) => void {
    let currentPort = connect();

    function connect(): chrome.runtime.Port {
        const port = chrome.runtime.connect();

        port.onMessage.addListener(function onMessage(message) {
            store.dispatch(message as Action);
        });

        port.onDisconnect.addListener(function onDisconnect() {
            currentPort = null;
        });

        return port;
    }

    return (action, next) => {
        if (action.type === RUN_IN_BACKGROUND) {
            if (!currentPort) {
                currentPort = connect();
            }
            currentPort.postMessage(action.payload);
        } else {
            next(action);
        }
    };
}
