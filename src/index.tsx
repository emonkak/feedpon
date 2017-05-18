import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import StoreProvider from 'utils/flux/react/StoreProvider';
import asyncMiddleware from 'utils/flux/middlewares/asyncMiddleware';
import createStore from 'utils/flux/createStore';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import restoreState from 'utils/restoreState';
import routes from 'components/routes';
import saveStateMiddleware from 'utils/flux/middlewares/saveStateMiddleware';
import { State } from 'messaging/types';

function saveItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
}

function restoreItem(key: string): any {
    const jsonString = localStorage.getItem(key);

    if (typeof jsonString === 'string' && jsonString !== '') {
        try {
            return JSON.parse(jsonString);
        } catch (_e) {
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
    stream: initialState.stream.version,
    subscriptions: initialState.subscriptions.version
};

const state = {
    ...initialState,
    ...restoreState<State>(versions, restoreItem)
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
