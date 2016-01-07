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
import { FromEventPatternObservable } from 'rxjs/observable/fromEventPattern';
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { _catch } from 'rxjs/operator/catch';
import { _do } from 'rxjs/operator/do';
import { concat } from 'rxjs/operator/concat';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { merge } from 'rxjs/operator/merge-static';

// XXX: ScalarObservable is buggy. Use this instead
function ofScalar(value) {
    return Observable.create(observer => {
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
                ::concat(ofScalar({ eventType: ActionDone, action }))
                ::_catch(error => ofScalar({ eventType: ActionFailed, action, error }))
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
