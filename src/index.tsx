import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import Store from 'utils/Store';
import StoreContext from 'utils/react/StoreContext';
import asyncMiddleware from 'utils/middlewares/asyncMiddleware';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import routes from 'components/routes';
import saveStateMiddleware from 'utils/middlewares/saveStateMiddleware';
import { Event, State } from 'messaging/types';

function saveState(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
}

const stateKeys = Object.keys(initialState);

const state = stateKeys.reduce((result, key) => {
    const jsonString = localStorage.getItem(key);

    if (jsonString) {
        try {
            result[key] = JSON.parse(jsonString);
        } catch (_e) {
        }
    }

    return result;
}, {...initialState} as any);

const store = new Store<Event, State>(reducer, state)
    .pipe(asyncMiddleware)
    .pipe(saveStateMiddleware(stateKeys, saveState))
    .pipe((action, next, getState) => {
        next(action);

        console.log(action);
    });

const element = document.getElementById('app');

ReactDOM.render((
    <StoreContext store={store}>
        <Router history={hashHistory}>
            {routes}
        </Router>
    </StoreContext>
), element);
