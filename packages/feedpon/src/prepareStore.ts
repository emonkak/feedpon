import { createLogger } from 'redux-logger';

import IndexedDBEventStore from 'feedpon-utils/flux/persistence/IndexedDBEventStore';
import applyMiddlewares from 'feedpon-utils/flux/applyMiddlewares';
import createStore from 'feedpon-utils/flux/createStore';
import errorHandlingMiddleware from 'feedpon-utils/flux/middlewares/errorHandlingMiddleware';
import eventSourcingMiddleware from 'feedpon-utils/flux/persistence/eventSourcingMiddleware';
import initialState from 'feedpon-messaging/initialState';
import packageJson from '../package.json';
import reducer from 'feedpon-messaging/reducer';
import reduxMiddleware from 'feedpon-utils/flux/middlewares/reduxMiddleware';
import restoreSnapshot from 'feedpon-utils/flux/persistence/restoreSnapshot';
import thunkMiddleware from 'feedpon-utils/flux/middlewares/thunkMiddleware';
import type { Event, State, ThunkContext } from 'feedpon-messaging';
import { EventStore } from 'feedpon-utils/flux/persistence/types';
import { Middleware, Store } from 'feedpon-utils/flux/types';
import { sendNotification } from 'feedpon-messaging/notifications';

export default async function prepareStore(context: ThunkContext): Promise<Store<State, Event>> {
    const eventStore = new IndexedDBEventStore<State, Event>();

    await migrateFromLocalStorage(eventStore);

    const snapshot = await restoreSnapshot(eventStore, reducer, initialState);

    const middlewares: Middleware<State, Event>[] = [
        errorHandlingMiddleware((error, { dispatch }) => {
            console.error(error);

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

    if (process.env['NODE_ENV'] !== 'production') {
        middlewares.push(reduxMiddleware(createLogger({
            collapsed: true,
            duration: true
        })));
    }

    const store = applyMiddlewares(createStore(reducer, snapshot.state), middlewares);

    if (typeof chrome === 'object') {
        const totalUnreadCountSelector = context.selectors.totalUnreadCountSelector;

        let prevTotalUnreadCount = 0;

        store.subscribe((state) => {
            const totalUnreadCount = totalUnreadCountSelector(state);

            if (totalUnreadCount !== prevTotalUnreadCount) {
                chrome.action.setBadgeText({
                    text: totalUnreadCount > 0 ? totalUnreadCount + '' : ''
                });

                prevTotalUnreadCount = totalUnreadCount;
            }
        });
    }

    store.dispatch({
        type: 'APPLICATION_INITIALIZED',
        version: packageJson.version
    });

    return store;
}

async function migrateFromLocalStorage(eventStore: EventStore<State, Event>): Promise<void> {
    const isMigrated = !!localStorage.getItem('__isMigratedToEventStore');

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

        localStorage.setItem('__isMigratedToEventStore', '' + Date.now());
    }
}
