import FastClick from 'fastclick';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { createLogger } from 'redux-logger';

import StoreProvider from 'utils/flux/react/StoreProvider';
import applyMiddlewares from 'utils/flux/applyMiddlewares';
import createStore from 'utils/flux/createStore';
import errorHandlingMiddleware from 'utils/flux/middlewares/errorHandlingMiddleware';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import reduxMiddleware from 'utils/flux/middlewares/reduxMiddleware';
import routes from 'components/routes';
import saveStateMiddleware from 'utils/flux/middlewares/saveStateMiddleware';
import thunkMiddleware from 'utils/flux/middlewares/thunkMiddleware';
import { Event, State, ThunkContext } from 'messaging/types';
import { Middleware, Store } from 'utils/flux/types';
import { sendNotification } from 'messaging/notifications/actions';

export default function app(save: (key: string, value: any) => Promise<void>, restore: (key: string) => Promise<any>): Store<State, Event> {
    const context: ThunkContext = {
        environment: {
            clientId: 'feedly',
            clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
            scope: 'https://cloud.feedly.com/subscriptions',
            redirectUri: 'https://www.feedly.com/feedly.html'
        },
        router: hashHistory
    };

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
        saveStateMiddleware(save, 1000)
    ];

    if (process.env.NODE_ENV !== 'production') {
        middlewares.push(reduxMiddleware(createLogger({ duration: true })));
    }

    const store = applyMiddlewares(createStore(reducer, initialState), middlewares);

    restoreState(initialState, restore).then((partialState) => {
        const state = {
            ...store.getState(),
            ...partialState
        };

        store.replaceState(state);

        store.dispatch({
            type: 'APPLICATION_INITIALIZED'
        });
    });

    FastClick.attach(document.body);

    const element = document.getElementById('app');

    ReactDOM.render((
        <StoreProvider store={store}>
            <Router history={hashHistory}>
                {routes}
            </Router>
        </StoreProvider>
    ), element);

    return store;
}

async function restoreState<TState extends Record<keyof TState, { version: number }>>(
    initialState: TState,
    restore: <TKey extends keyof TState>(key: TKey) => Promise<TState[TKey] | null>
): Promise<Partial<TState>> {
    const state: Partial<TState> = {};

    for (const key in initialState) {
        let data;

        try {
            data = await restore(key);
        } catch (_error) {
        }

        const { version } = initialState[key];

        if (data != null && data.version === version) {
            state[key] = data;
        }
    }

    return state;
}
