import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import Store from 'supports/Store';
import StoreContext from 'supports/react/StoreContext';
import asyncMiddleware from 'supports/middlewares/asyncMiddleware';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import routes from 'components/routes';
import { Event, State } from 'messaging/types';

const store = new Store<Event, State>(reducer, initialState)
    .pipe(asyncMiddleware)
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
