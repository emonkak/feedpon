import 'regenerator/runtime'

import ActionDispatcher from './shared/dispatchers/ActionDispatcher'
import App from './components/react/App'
import AppContext from './components/react/AppContext'
import AuthenticateHandler from './handlers/AuthenticateHandler'
import ChromeBackgroundActionDispatcher from './shared/dispatchers/ChromeBackgroundActionDispatcher'
import DispatchEventHandler from './handlers/DispatchEventHandler'
import HistoryActionsHandler from './handlers/HistoryActionsHandler'
import React from 'react'
import ReactDOM from 'react-dom'
import connectToStore from './components/react/connectToStore'
import container from './container'
import fromChromeEvent from './utils/fromChromeEvent'
import { ActionDone, ActionFailed } from './constants/eventTypes'
import { Authenticate, DispatchEvent, History } from './constants/actionTypes'
import { ScalarObservable } from 'rxjs/observable/ScalarObservable'
import { Subject } from 'rxjs/Subject'
import { _catch } from 'rxjs/operator/catch'
import { _do } from 'rxjs/operator/do'
import { concat } from 'rxjs/operator/concat'
import { concatMap } from 'rxjs/operator/concatMap'
import { defer } from 'rxjs/observable/defer'
import { delay } from 'rxjs/operator/delay'
import { empty } from 'rxjs/observable/empty'
import { hashHistory } from 'react-router'
import { mergeMap } from 'rxjs/operator/mergeMap'
import { mergeStatic } from 'rxjs/operator/merge'
import { repeat } from 'rxjs/operator/repeat'
import { takeUntil } from 'rxjs/operator/takeUntil'

const actionSubject = new Subject()
const actionDispatcher = new ActionDispatcher(container)
    .mount(Authenticate, AuthenticateHandler)
    .mount(DispatchEvent, DispatchEventHandler)
    .mount(History.GoBack, HistoryActionsHandler)
    .mount(History.GoForward, HistoryActionsHandler)
    .mount(History.Push, HistoryActionsHandler)
    .mount(History.Replace, HistoryActionsHandler)
    .fallback(new ChromeBackgroundActionDispatcher())

const eventStreamByLocalAction = actionSubject
    ::_do(action => console.log(action))
    ::mergeMap(action => {
        return actionDispatcher.dispatch(action)
            ::concat(ScalarObservable.create({ eventType: ActionDone, action }))
            ::_catch(error => ScalarObservable.create({ eventType: ActionFailed, action, error }))
    })
const eventStreamByChromeMessage = defer(() => ScalarObservable.create(chrome.runtime.connect()))
    ::_do(port => console.log(port))
    ::concatMap(port => {
        const disconnected = fromChromeEvent(port.onDisconnect)
        return fromChromeEvent(port.onMessage)
            ::takeUntil(disconnected)
            ::concat(empty()::delay(1000))
    })
    ::repeat()
const eventStream = mergeStatic(eventStreamByLocalAction, eventStreamByChromeMessage)
    ::_do(event => console.log(event))

const element = document.getElementById('app')

container.set('history', hashHistory)

ReactDOM.render(
    <AppContext actionSubject={actionSubject} eventStream={eventStream}>
        <App history={hashHistory} />
    </AppContext>,
    element
)
