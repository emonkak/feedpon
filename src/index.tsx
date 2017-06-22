import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { createLogger } from 'redux-logger';

import * as Trie from 'utils/containers/Trie';
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
import waitForReadyState from 'utils/dom/waitForReadyState';
import { ThunkContext } from 'messaging/types';

(window as any).Trie = Trie;

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

const context: ThunkContext = {
    environment: {
        clientId: 'feedly',
        clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
        scope: 'https://cloud.feedly.com/subscriptions',
        redirectUri: 'https://www.feedly.com/feedly.html'
    },
    router: hashHistory
};

const store = applyMiddlewares(createStore(reducer, state), [
    errorHandlingMiddleware((error, { dispatch }) => {
        const errorString = (error + '') || 'Unknown error occured';

        dispatch(sendNotification(
            errorString,
            'negative'
        ));
    }),
    thunkMiddleware(context),
    saveStateMiddleware(save, 10000),
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

waitForReadyState(document, ['complete', 'interactive'], () => {
    store.dispatch({
        type: 'APPLICATION_INITIALIZED'
    });
});
