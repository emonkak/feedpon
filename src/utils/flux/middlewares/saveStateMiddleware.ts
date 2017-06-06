import { Middleware } from '../types';

function saveStateMiddlewareFactory<TState, TEvent>(save: (key: string, value: any) => void): Middleware<TState, TEvent> {
    let queue: { [key: string]: any } = {};
    let request: number | null = null;

    function processQueue() {
        for (const key of Object.keys(queue)) {
            save(key, queue[key]);
        }

        queue = {};
        request = null;
    }

    return ({ getState }) => (event, next) => {
        const state = getState();

        const result = next(event);

        const nextState = getState();

        let shouldSave = false;

        for (const key in state) {
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

export default saveStateMiddlewareFactory;
