import React from 'react';
import { hashHistory } from 'react-router';
import { render } from 'react-dom';

import App from './components/App';
import Context from './supports/react/Context';
import Store from './supports/Store';
import chromePortMiddleware from './middlewares/chromePortMiddleware';
import historyMiddleware from './middlewares/historyMiddleware';
import initialState from './messaging/initialState';
import reducer from './messaging/reducer';
import { Action, State } from './messaging/types';

const store = new Store<Action, State>(reducer, initialState);

store
    .pipe(chromePortMiddleware(store))
    .pipe(historyMiddleware(hashHistory))
    .pipe((action, next) => {
        console.log(action);

        next(action);
    });

render(
    <Context store={store}>
        <App history={hashHistory} />
    </Context>,
    document.getElementById('app')
);
