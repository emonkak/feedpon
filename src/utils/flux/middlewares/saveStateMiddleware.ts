import throttle from 'lodash.throttle';

import throttleIdleCallback from '../../throttleIdleCallback';
import { Middleware } from '../types';

function saveStateMiddlewareFactory<TState, TEvent>(save: (state: any) => Promise<void>, saveInterval: number): Middleware<TState, TEvent> {
    let queue: Partial<TState> = {};

    const processQueue = throttle(throttleIdleCallback(async () => {
        const items = queue;

        queue = {};

        await save(items);
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
