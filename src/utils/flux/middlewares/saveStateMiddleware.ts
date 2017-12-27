import throttle from 'lodash.throttle';

import throttleIdleCallback from '../../throttleIdleCallback';
import { Middleware } from '../types';

function saveStateMiddlewareFactory<TState, TEvent>(save: (state: any) => Promise<void>, saveInterval: number): Middleware<TState, TEvent> {
    let changes: Partial<TState> = {};
    let numChanges = 0;

    const processQueue = throttle(throttleIdleCallback(() => {
        if (numChanges > 0) {
            const items = changes;

            changes = {};
            numChanges = 0;

            save(items);
        }
    }), saveInterval);

    return ({ getState }) => (event, next) => {
        const state = getState();
        const result = next(event);
        const nextState = getState();

        for (const key in state) {
            if (state[key] !== nextState[key]) {
                changes[key] = nextState[key];
                numChanges++;
            }
        }

        if (numChanges > 0) {
            processQueue();
        }

        return result;
    };
}

export default saveStateMiddlewareFactory;
