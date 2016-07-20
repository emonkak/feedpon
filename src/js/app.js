/* global chrome document */
/* eslint no-console: 0 */

import ActionDispatcher from './shared/dispatchers/ActionDispatcher';
import App from './components/react/App';
import AppContext from './shared/components/react/AppContext';
import AuthenticateHandler from './handlers/AuthenticateHandler';
import ChromeBackgroundActionDispatcher from './shared/dispatchers/ChromeBackgroundActionDispatcher';
import HistoryActionsHandler from './handlers/HistoryActionsHandler';
import React from 'react';
import ReactDOM from 'react-dom';
import container from './container';
import fromChromeEvent from './utils/fromChromeEvent';
import { ActionDone, ActionFailed } from './constants/eventTypes';
import { Authenticate, History } from './constants/actionTypes';
import { ScalarObservable } from 'rxjs/observable/ScalarObservable';
import { Subject } from 'rxjs/Subject';
import { _catch } from 'rxjs/operator/catch';
import { _do } from 'rxjs/operator/do';
import { concat } from 'rxjs/operator/concat';
import { concatMap } from 'rxjs/operator/concatMap';
import { defer } from 'rxjs/observable/defer';
import { delay } from 'rxjs/operator/delay';
import { empty } from 'rxjs/observable/empty';
import { hashHistory } from 'react-router';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { mergeStatic } from 'rxjs/operator/merge';
import { repeat } from 'rxjs/operator/repeat';
import { takeUntil } from 'rxjs/operator/takeUntil';

const actions = new Subject();
const actionDispatcher = new ActionDispatcher(container)
    .mount(Authenticate, AuthenticateHandler)
    .mount(History.GoBack, HistoryActionsHandler)
    .mount(History.GoForward, HistoryActionsHandler)
    .mount(History.Push, HistoryActionsHandler)
    .mount(History.Replace, HistoryActionsHandler)
    .fallback(new ChromeBackgroundActionDispatcher());

const eventsByLocalAction = actions
    ::_do(action => console.debug(action))
    ::mergeMap(action => {
        return actionDispatcher.dispatch(action)
            ::concat(ScalarObservable.create({ eventType: ActionDone, action }))
            ::_catch(error => ScalarObservable.create({ eventType: ActionFailed, action, error }));
    });
const eventsByChromeMessage = defer(() => ScalarObservable.create(chrome.runtime.connect()))
    ::_do(port => console.debug(port))
    ::concatMap(port => {
        const disconnected = fromChromeEvent(port.onDisconnect);
        return fromChromeEvent(port.onMessage)
            ::takeUntil(disconnected)
            ::concat(empty()::delay(1000));
    })
    ::repeat();
const events = mergeStatic(eventsByLocalAction, eventsByChromeMessage)
    ::_do(event => console.debug(event));

const element = document.getElementById('app');

container.set('history', hashHistory);

ReactDOM.render(
    <AppContext actions={actions} events={events}>
        <App history={hashHistory} />
    </AppContext>,
    element
);
