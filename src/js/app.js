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
import { ActionDone, ActionFailed } from './constants/eventTypes'
import { Authenticate } from './constants/actionTypes'
import { FromEventPatternObservable } from 'rxjs/observable/fromEventPattern'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subject } from 'rxjs/Subject'
import { _catch } from 'rxjs/operator/catch'
import { _do } from 'rxjs/operator/do';
import { concat } from 'rxjs/operator/concat'
import { merge } from 'rxjs/operator/merge-static'
import { mergeMap } from 'rxjs/operator/mergeMap'

// XXX: ScalarObservable is buggy. Use this instead
function fromScalar<T>(value: T): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
        observer.next(value)
        observer.complete()
    })
}

function bootstrap() {
    const actionSubject = new Subject()
    const actionDispatcher = new ActionDispatcher(container)
        .mount(Authenticate, AuthenticateHandler)
        .fallback(new ChromeBackgroundActionDispatcher())

    const port = chrome.runtime.connect()
    const eventStreamByLocalAction = actionSubject
        ::_do(action => console.log(action))
        ::mergeMap(action => {
            return actionDispatcher.dispatch(action)
                ::concat(fromScalar({ eventType: ActionDone, action }))
                ::_catch(error => fromScalar({ eventType: ActionFailed, action, error }))
        })
    const eventStreamByChromeMessage = FromEventPatternObservable.create(
        ::port.onMessage.addListener,
        ::port.onMessage.removeListener
    )
    const eventStream = merge(eventStreamByLocalAction, eventStreamByChromeMessage)
        ::_do(event => console.log(event))

    const element = document.getElementById('app')
    return ReactDOM.render(
        <AppContext actionSubject={actionSubject} eventStream={eventStream}>
            <App />
        </AppContext>,
        element
    )
}

bootstrap()
