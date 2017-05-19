import { Middleware } from '../types';

export default function saveStateMiddlewareFactory(keysToSave: string[], save: (key: string, value: any) => void): Middleware<any, any> {
    let queue: { [key: string]: any } = {};
    let request: number | null = null;

    function processQueue() {
        for (const key of Object.keys(queue)) {
            save(key, queue[key]);
        }

        queue = {};
        request = null;
    }

    return function saveStateMiddleware(event, next, { getState }) {
        const state = getState();

        const result = next(event);

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

        return result;
    };
}
