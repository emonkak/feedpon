import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import StoreProvider from 'utils/flux/react/StoreProvider';
import asyncMiddleware from 'utils/flux/middlewares/asyncMiddleware';
import createStore from 'utils/flux/createStore';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import routes from 'components/routes';
import saveStateMiddleware from 'utils/flux/middlewares/saveStateMiddleware';

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

const store = createStore(reducer, state, [
    asyncMiddleware,
    saveStateMiddleware(stateKeys, saveState),
    ((action, next, context) => {
        next(action);

        console.log(action);
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
