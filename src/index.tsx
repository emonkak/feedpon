import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { createLogger } from 'redux-logger';

import StoreProvider from 'utils/flux/react/StoreProvider';
import applyMiddlewares from 'utils/flux/applyMiddlewares';
import asyncMiddleware from 'utils/flux/middlewares/asyncMiddleware';
import createStore from 'utils/flux/createStore';
import errorHandlingMiddleware from 'utils/flux/middlewares/errorHandlingMiddleware';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import reduxMiddleware from 'utils/flux/middlewares/reduxMiddleware';
import restoreState from 'utils/restoreState';
import routes from 'components/routes';
import saveStateMiddleware from 'utils/flux/middlewares/saveStateMiddleware';
import waitForReadyState from 'utils/dom/waitForReadyState';
import { sendNotification } from 'messaging/notifications/actions';

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

const state = restoreState(initialState, restore);

const context = {
    environment: {
        clientId: 'feedly',
        clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
        scope: 'https://cloud.feedly.com/subscriptions',
        redirectUri: 'https://www.feedly.com/feedly.html'
    }
};

const store = applyMiddlewares(createStore(reducer, state), [
    errorHandlingMiddleware((error, { dispatch }) => {
        console.error(error);

        const errorString = (error + '') || 'Unknown error occured';

        dispatch(sendNotification(
            errorString,
            'negative'
        ));
    }),
    asyncMiddleware(context),
    saveStateMiddleware(save, 1000),
    reduxMiddleware(createLogger({ duration: true }))
]);

const element = document.getElementById('app');

ReactDOM.render((
    <StoreProvider store={store}>
        <Router history={hashHistory}>
            {routes}
        </Router>
    </StoreProvider>
), element);

waitForReadyState(document, 'interactive', () => {
    store.dispatch({
        type: 'APPLICATION_INITIALIZED'
    });
});
