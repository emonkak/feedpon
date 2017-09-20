import throttle from 'lodash.throttle';

import throttleIdleCallback from '../../throttleIdleCallback';
import { Middleware } from '../types';

function saveStateMiddlewareFactory<TState, TEvent>(save: (key: string, value: any) => Promise<void>, saveInterval: number): Middleware<TState, TEvent> {
    let queue: Partial<TState> = {};

    const processQueue = throttle(throttleIdleCallback(async () => {
        const data = queue;

        queue = {};

        for (const key in data) {
            await save(key, data[key]);
        }
    }), saveInterval);

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

        if (shouldSave) {
            processQueue();
        }

        return result;
    };
}

export default saveStateMiddlewareFactory;
