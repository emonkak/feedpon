import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import Store from 'supports/Store';
import StoreContext from 'supports/components/StoreContext';
import asyncMiddleware from 'supports/middlewares/asyncMiddleware';
import historyMiddleware from 'supports/middlewares/historyMiddleware';
import initialState from 'messaging/initialState';
import reducer from 'messaging/reducer';
import routes from 'components/routes';
import { Action, State } from 'messaging/types';

const store = new Store<Action, State>(reducer, initialState)
    .pipe(asyncMiddleware)
    .pipe(historyMiddleware(hashHistory));

const element = document.getElementById('app');

ReactDOM.render((
    <StoreContext store={store}>
        <Router history={hashHistory}>
            {routes}
        </Router>
    </StoreContext>
), element);
