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
import restoreState from 'utils/restoreState';
import routes from 'components/routes';
import saveStateMiddleware from 'utils/flux/middlewares/saveStateMiddleware';
import thunkMiddleware from 'utils/flux/middlewares/thunkMiddleware';
import { ThunkContext } from 'messaging/types';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { createVisibleSubscriptionsSelector } from 'messaging/subscriptions/selectors';
import { sendNotification } from 'messaging/notifications/actions';

function main() {
    const state = restoreState(initialState, restore);

    const context: ThunkContext = {
        environment: {
            clientId: 'feedly',
            clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
            scope: 'https://cloud.feedly.com/subscriptions',
            redirectUri: 'https://www.feedly.com/feedly.html'
        },
        router: hashHistory,
        selectors: {
            visibleSubscriptionsSelector: createVisibleSubscriptionsSelector(),
            sortedCategoriesSelector: createSortedCategoriesSelector()
        }
    };

    const middlewares = [
        errorHandlingMiddleware((error, { dispatch }) => {
            const errorString = (error + '') || 'Unknown error occured';

            dispatch(sendNotification(
                errorString,
                'negative',
                0
            ));
        }),
        thunkMiddleware(context),
        saveStateMiddleware(save, 1000),
    ];

    if (process.env.NODE_ENV !== 'production') {
        middlewares.push(reduxMiddleware(createLogger({ duration: true })));
    }

    const store = applyMiddlewares(createStore(reducer, state), middlewares);

    store.dispatch({
        type: 'APPLICATION_INITIALIZED'
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
}

function save(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
}

function restore(key: string): any {
    const jsonString = localStorage.getItem(key);

    if (typeof jsonString === 'string' && jsonString !== '') {
        try {
            return JSON.parse(jsonString);
        } catch (_error) {
        }
    }

    return null;
}

if (typeof cordova === 'object') {
    document.addEventListener('deviceready', main);
} else {
    main();
}
