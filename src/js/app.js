import 'regenerator/runtime'

import ActionDispatcher from './actionDispatchers/actionDispatcher'
import AppContainer from './components/appContainer'
import AppRoot from './components/appRoot'
import AuthenticateHandler from './actionHandlers/authenticateHandler'
import ChromeBackgroundActionDispatcher from './actionDispatchers/chromeBackgroundActionDispatcher'
import EventDispatcher from './eventDispatchers/eventDispatcher'
import GetFullContentHandler from './actionHandlers/getFullContentHandler'
import LoggedActionDispatcher from './actionDispatchers/loggedActionDispatcher'
import LoggedEventDispatcher from './eventDispatchers/loggedEventDispatcher'
import ObservableActionDispatcher from './actionDispatchers/observableActionDispatcher'
import React from 'react'
import ReactDOM from 'react-dom'
import SelectStreamHandler from './actionHandlers/selectStreamHandler'
import appState from './appState'
import container from './container'
import { Authenticate, SelectStream } from './constants/actionTypes'
import { EventEmitter } from 'events'
import { IEventDispatcher } from './eventDispatchers/interfaces'

function bootstrap() {
    const eventEmitter = new EventEmitter()
    const eventDispatcher = new LoggedEventDispatcher(new EventDispatcher(eventEmitter))
    const actionDispatcher = new LoggedActionDispatcher(
        new ObservableActionDispatcher(
            new ActionDispatcher(container, eventDispatcher, new ChromeBackgroundActionDispatcher())
                .mount(Authenticate, AuthenticateHandler)
                .mount(SelectStream, SelectStreamHandler),
            eventDispatcher
        )
    )

    const port = chrome.runtime.connect()
    port.onMessage.addListener(::eventDispatcher.dispatch)

    const appEl = document.getElementById('app')

    appState(eventEmitter).subscribe(state => {
        ReactDOM.render(
            <AppContainer actionDispatcher={actionDispatcher}>
                <AppRoot {...state} />
            </AppContainer>,
            appEl
        )
    })
}

bootstrap()
