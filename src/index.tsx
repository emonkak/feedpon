import React from 'react';
import ReactDOM from 'react-dom';
import smoothscroll from 'smoothscroll-polyfill';
import { Router, hashHistory } from 'react-router';

import Store from 'utils/Store';
import StoreContext from 'utils/components/StoreContext';
import asyncMiddleware from 'utils/middlewares/asyncMiddleware';
import historyMiddleware from 'utils/middlewares/historyMiddleware';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import routes from 'components/routes';
import { Event, State } from 'messaging/types';

smoothscroll.polyfill();

const store = new Store<Event, State>(reducer, initialState)
    .pipe(asyncMiddleware)
    .pipe(historyMiddleware(hashHistory))
    .pipe((action, next) => {
        console.log(action);

        next(action);
    });

const element = document.getElementById('app');

ReactDOM.render((
    <StoreContext store={store}>
        <Router history={hashHistory}>
            {routes}
        </Router>
    </StoreContext>
), element);
