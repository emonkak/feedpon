import { Middleware } from '../types';

export default function saveStateMiddleware(keysToSave: string[], saveState: (key: string, value: any) => void): Middleware<any, any> {
    let queue: { [key: string]: any } = {};
    let request: number | null = null;

    function processQueue() {
        for (const key of Object.keys(queue)) {
            saveState(key, queue[key]);
        }

        queue = {};
        request = null;
    }

    return (action, next, { getState }) => {
        const state = getState();

        next(action);

        const nextState = getState();

        let shouldSave = false;

        for (const key of keysToSave) {
            if (state[key] !== nextState[key]) {
                queue[key] = nextState[key];
                shouldSave = true;
            }
        }

        if (shouldSave && request === null) {
            request = window.requestIdleCallback(processQueue);
        }
    };
}
