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

const versions = {
    categories: initialState.categories.version,
    credential: initialState.credential.version,
    notifications: initialState.notifications.version,
    search: initialState.search.version,
    siteinfo: initialState.siteinfo.version,
    streamSettings: initialState.streamSettings.version,
    streams: initialState.streams.version,
    subscriptions: initialState.subscriptions.version,
    trackingUrlSettings: initialState.trackingUrlSettings.version
};

const state = {
    ...initialState,
    ...restoreState(versions, restore),
    version: chrome.runtime.getManifest().version
};

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

        dispatch(sendNotification(
            'Error occured: ' + error,
            'negative',
            0
        ));
    }),
    asyncMiddleware(context),
    saveStateMiddleware(save),
    reduxMiddleware(createLogger({ diff: true }))
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
