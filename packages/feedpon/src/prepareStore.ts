import { createLogger } from 'redux-logger';

import type { Middleware, Store } from 'feedpon-flux';
import { applyMiddlewares, createStore } from 'feedpon-flux';
import errorHandlingMiddleware from 'feedpon-flux/middlewares/errorHandlingMiddleware';
import eventSourcingMiddleware from 'feedpon-flux/middlewares/eventSourcingMiddleware';
import reduxMiddleware from 'feedpon-flux/middlewares/reduxMiddleware';
import thunkMiddleware from 'feedpon-flux/middlewares/thunkMiddleware';
import IndexedDBEventStore from 'feedpon-flux/persistence/IndexedDBEventStore';
import {
  type EventStore,
  restoreSnapshot,
} from 'feedpon-flux/persistence/index';
import type { Event, State, ThunkContext } from 'feedpon-messaging';
import initialState from 'feedpon-messaging/initialState';
import { sendNotification } from 'feedpon-messaging/notifications';
import reducer from 'feedpon-messaging/reducer';
import packageJson from '../package.json';

export default async function prepareStore(
  context: ThunkContext,
): Promise<Store<State, Event>> {
  const eventStore = new IndexedDBEventStore<State, Event>();

  await migrateFromLocalStorage(eventStore);

  const snapshot = await restoreSnapshot(eventStore, reducer, initialState);

  const middlewares: Middleware<State, Event>[] = [
    errorHandlingMiddleware((error, { dispatch }) => {
      console.error(error);

      const errorString = error + '' || 'Unknown error occured';

      dispatch(sendNotification(errorString, 'negative', 0));
    }),
    thunkMiddleware(context),
    eventSourcingMiddleware<State, Event>(eventStore, snapshot.version, 200),
  ];

  DEBUG: {
    middlewares.push(
      reduxMiddleware(
        createLogger({
          collapsed: true,
          duration: true,
        }),
      ),
    );
  }

  const store = applyMiddlewares(
    createStore(reducer, snapshot.state),
    middlewares,
  );

  if (typeof chrome === 'object') {
    const totalUnreadCountSelector = context.selectors.totalUnreadCountSelector;

    let prevTotalUnreadCount = 0;

    store.subscribe((state) => {
      const totalUnreadCount = totalUnreadCountSelector(state);

      if (totalUnreadCount !== prevTotalUnreadCount) {
        chrome.action.setBadgeText({
          text: totalUnreadCount > 0 ? totalUnreadCount + '' : '',
        });

        prevTotalUnreadCount = totalUnreadCount;
      }
    });
  }

  store.dispatch({
    type: 'APPLICATION_INITIALIZED',
    version: packageJson.version,
  });

  return store;
}

async function migrateFromLocalStorage(
  eventStore: EventStore<State, Event>,
): Promise<void> {
  const isMigrated = !!localStorage.getItem('__isMigratedToEventStore');

  if (!isMigrated) {
    const keys = Object.keys(initialState) as (keyof State)[];
    const state = keys.reduce<State>(
      (state, key) => {
        const jsonString = localStorage.getItem(key);
        if (jsonString !== null) {
          try {
            state[key] = JSON.parse(jsonString);
          } catch (error) {
            console.error(error);
          }
        }
        return state;
      },
      { ...initialState },
    );

    const snapshot = {
      state,
      version: 1,
    };

    await eventStore.saveSnapshot(snapshot);

    localStorage.setItem('__isMigratedToEventStore', '' + Date.now());
  }
}
