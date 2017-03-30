import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import Store from 'supports/Store';
import StoreContext from 'supports/react/StoreContext';
import asyncMiddleware from 'supports/middlewares/asyncMiddleware';
import initialState from 'messaging/initialState';
import persistenceMiddleware from 'supports/middlewares/persistenceMiddleware';
import reducer from 'messaging/reducer';
import routes from 'components/routes';
import { Event, State } from 'messaging/types';

const store = new Store<Event, State>(reducer, initialState)
    .pipe(asyncMiddleware)
    .pipe(persistenceMiddleware('state', () => true))
    .pipe((action, next) => {
        console.log(action);

        next(action);
    });

const savedState = localStorage.getItem('state');

if (savedState) {
    store.replaceState(JSON.parse(savedState));
}

const element = document.getElementById('app');

ReactDOM.render((
    <StoreContext store={store}>
        <Router history={hashHistory}>
            {routes}
        </Router>
    </StoreContext>
), element);
