import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import StoreProvider from 'utils/flux/react/StoreProvider';
import asyncMiddleware from 'utils/flux/middlewares/asyncMiddleware';
import createStore from 'utils/flux/createStore';
import errorHandlingMiddleware from 'utils/flux/middlewares/errorHandlingMiddleware';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import restoreState from 'utils/restoreState';
import routes from 'components/routes';
import saveStateMiddleware from 'utils/flux/middlewares/saveStateMiddleware';
import { sendNotification } from 'messaging/notification/actions';

function saveItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
}

function restoreItem(key: string): any {
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
    credential: initialState.credential.version,
    notifications: initialState.notifications.version,
    search: initialState.search.version,
    settings: initialState.settings.version,
    siteinfo: initialState.siteinfo.version,
    streams: initialState.streams.version,
    subscriptions: initialState.subscriptions.version
};

const state = {
    ...initialState,
    ...restoreState(versions, restoreItem),
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

const store = createStore(reducer, state, [
    errorHandlingMiddleware((error, dispatch, getState) => {
        console.error(error);

        dispatch(sendNotification(
            'Error occured: ' + error,
            'negative',
            0
        ));
    }),
    asyncMiddleware(context),
    saveStateMiddleware(Object.keys(versions), saveItem),
    ((action, next) => {
        console.log(action);

        next(action);
    })
]);

const element = document.getElementById('app');

ReactDOM.render((
    <StoreProvider store={store}>
        <Router history={hashHistory}>
            {routes}
        </Router>
    </StoreProvider>
), element);

function handleReadyStateChange() {
    if (document.readyState === 'complete') {
        store.dispatch({
            type: 'APPLICATION_INITIALIZED'
        });

        document.removeEventListener('readystatechange', handleReadyStateChange);
    }
}

document.addEventListener('readystatechange', handleReadyStateChange);

handleReadyStateChange();
