import ActionDispatcher from './actionDispatchers/actionDispatcher'
import AppContainer from './components/appContainer'
import AppRoot from './components/appRoot'
import AuthenticateHandler from './actionHandlers/authenticateHandler'
import ChromeBackgroundActionDispatcher from './actionDispatchers/chromeBackgroundActionDispatcher'
import EventDispatcher from './eventDispatchers/eventDispatcher'
import LoggedActionDispatcher from './actionDispatchers/loggedActionDispatcher'
import LoggedEventDispatcher from './eventDispatchers/loggedEventDispatcher'
import ObservableActionDispatcher from './actionDispatchers/observableActionDispatcher'
import React from 'react'
import ReactDOM from 'react-dom'
import actionTypes from './constants/actionTypes'
import container from './container'
import { EventEmitter } from 'events'
import { IEventDispatcher } from './eventDispatchers/interfaces'

function bootstrap() {
    const eventEmitter = new EventEmitter()
    const eventDispatcher = new LoggedEventDispatcher(new EventDispatcher(eventEmitter))
    const actionDispatcher = new LoggedActionDispatcher(
        new ObservableActionDispatcher(
            new ActionDispatcher(container, new ChromeBackgroundActionDispatcher())
                .mount(actionTypes.AUTHENTICATE, AuthenticateHandler),
            eventDispatcher
        )
    )

    container.set(IEventDispatcher, eventDispatcher)

    const port = chrome.extension.connect()
    port.onMessage.addListener(::eventDispatcher.dispatch)

    ReactDOM.render(
        <AppContainer actionDispatcher={actionDispatcher} eventEmitter={eventEmitter}>
            <AppRoot />
        </AppContainer>,
        document.getElementById('app')
    )
}

bootstrap()
