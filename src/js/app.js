import 'regenerator/runtime'

import ActionDispatcher from './shared/dispatchers/ActionDispatcher'
import App from './components/react/App'
import AppContext from './components/react/AppContext'
import AuthenticateHandler from './handlers/AuthenticateHandler'
import ChromeBackgroundActionDispatcher from './shared/dispatchers/ChromeBackgroundActionDispatcher'
import React from 'react'
import ReactDOM from 'react-dom'
import connectToStore from './components/react/connectToStore'
import container from './container'
import fromChromeEvent from './utils/fromChromeEvent'
import fromScalar from './utils/fromScalar'
import { ActionDone, ActionFailed } from './constants/eventTypes'
import { Authenticate } from './constants/actionTypes'
import { DeferObservable } from 'rxjs/observable/defer'
import { EmptyObservable } from 'rxjs/observable/empty'
import { FromEventPatternObservable } from 'rxjs/observable/fromEventPattern'
import { Subject } from 'rxjs/Subject'
import { _catch } from 'rxjs/operator/catch'
import { _do } from 'rxjs/operator/do'
import { concat } from 'rxjs/operator/concat'
import { concatMap } from 'rxjs/operator/concatMap'
import { delay } from 'rxjs/operator/delay'
import { merge } from 'rxjs/operator/merge-static'
import { mergeMap } from 'rxjs/operator/mergeMap'
import { repeat } from 'rxjs/operator/repeat'
import { takeUntil } from 'rxjs/operator/takeUntil'

const actionSubject = new Subject()
const actionDispatcher = new ActionDispatcher(container)
    .mount(Authenticate, AuthenticateHandler)
    .fallback(new ChromeBackgroundActionDispatcher())

const eventStreamByLocalAction = actionSubject
    ::_do(action => console.log(action))
    ::mergeMap(action => {
        return actionDispatcher.dispatch(action)
            ::concat(fromScalar({ eventType: ActionDone, action }))
            ::_catch(error => fromScalar({ eventType: ActionFailed, action, error }))
    })
const eventStreamByChromeMessage = DeferObservable
    .create(() => fromScalar(chrome.runtime.connect()))
    ::_do(port => console.log(port))
    ::concatMap(port => {
        const disconnected = fromChromeEvent(port.onDisconnect)
        return fromChromeEvent(port.onMessage)
            ::takeUntil(disconnected)
            ::concat(EmptyObservable.create()::delay(1000))
    })
    ::repeat()
const eventStream = merge(eventStreamByLocalAction, eventStreamByChromeMessage)
    ::_do(event => console.log(event))

const element = document.getElementById('app')

ReactDOM.render(
    <AppContext actionSubject={actionSubject} eventStream={eventStream}>
        <App />
    </AppContext>,
    element
)
