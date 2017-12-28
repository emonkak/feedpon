import throttle from 'lodash.throttle';

import throttleIdleCallback from '../../throttleIdleCallback';
import { Middleware } from '../types';

function saveStateMiddlewareFactory<TState, TEvent>(save: (state: any) => Promise<void>, saveInterval: number): Middleware<TState, TEvent> {
    let promise = Promise.resolve();
    let changes: Partial<TState> = {};
    let numChanges = 0;

    const saveChanges = async () => {
        try {
            await promise;
        } finally {
            if (numChanges > 0) {
                const savingChanges = changes;

                changes = {};
                numChanges = 0;

                promise = save(savingChanges);
            }
        }
    };

    const processChanges = throttle(throttleIdleCallback(saveChanges), saveInterval);

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
            processChanges();
        }

        return result;
    };
}

export default saveStateMiddlewareFactory;
