import { createLogger } from 'redux-logger';

import IndexedDBEventStore from 'persistence/IndexedDBEventStore';
import applyMiddlewares from 'utils/flux/applyMiddlewares';
import createStore from 'utils/flux/createStore';
import errorHandlingMiddleware from 'utils/flux/middlewares/errorHandlingMiddleware';
import eventSourcingMiddleware from 'persistence/eventSourcingMiddleware';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import reduxMiddleware from 'utils/flux/middlewares/reduxMiddleware';
import restoreSnapshot from 'persistence/restoreSnapshot';
import thunkMiddleware from 'utils/flux/middlewares/thunkMiddleware';
import { Event, State, ThunkContext } from 'messaging/types';
import { EventStore } from 'persistence/types';
import { Middleware, Store } from 'utils/flux/types';
import { sendNotification } from 'messaging/notifications/actions';

export default async function prepareStore(context: ThunkContext): Promise<Store<State, Event>> {
    const eventStore = new IndexedDBEventStore<State, Event>();

    await migrateFromLocalStorage(eventStore);

    const snapshot = await restoreSnapshot(eventStore, reducer, initialState);

    const middlewares: Middleware<State, Event>[] = [
        errorHandlingMiddleware((error, { dispatch }) => {
            const errorString = (error + '') || 'Unknown error occured';

            dispatch(sendNotification(
                errorString,
                'negative',
                0
            ));
        }),
        thunkMiddleware(context),
        eventSourcingMiddleware<State, Event>(eventStore, snapshot.version, 200)
    ];

    if (process.env.NODE_ENV !== 'production') {
        middlewares.push(reduxMiddleware(createLogger({ duration: true })));
    }

    const store = applyMiddlewares(createStore(reducer, snapshot.state), middlewares);

    if (typeof chrome === 'object') {
        const totalUnreadCountSelector = context.selectors.totalUnreadCountSelector;

        let prevTotalUnreadCount = 0;

        store.subscribe((state) => {
            const totalUnreadCount = totalUnreadCountSelector(state);

            if (totalUnreadCount !== prevTotalUnreadCount) {
                chrome.browserAction.setBadgeText({
                    text: totalUnreadCount > 0 ? totalUnreadCount + '' : ''
                });

                prevTotalUnreadCount = totalUnreadCount;
            }
        });
    }

    return store;
}

async function migrateFromLocalStorage(eventStore: EventStore<State, Event>): Promise<void> {
    const isMigrated = !!localStorage.getItem('__isMigratedToAnotherStorage');

    if (!isMigrated) {
        const keys = Object.keys(initialState) as (keyof State)[];
        const state = keys.reduce<State>((state, key) => {
            const jsonString = localStorage.getItem(key);
            if (jsonString !== null) {
                try {
                    state[key] = JSON.parse(jsonString);
                } catch (error) {
                    console.error(error);
                }
            }
            return state;
        }, { ...initialState });

        const snapshot = {
            state,
            version: 1
        };

        await eventStore.saveSnapshot(snapshot);

        localStorage.setItem('__isMigratedToAnotherStorage', '' + Date.now());
    }
}
