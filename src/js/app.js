import 'regenerator/runtime'

import ActionDispatcher from './actionDispatchers/ActionDispatcher'
import App from './components/react/App'
import AppContext from './components/react/AppContext'
import AuthenticateHandler from './actionHandlers/AuthenticateHandler'
import ChromeBackgroundActionDispatcher from './actionDispatchers/ChromeBackgroundActionDispatcher'
import EventDispatcher from './eventDispatchers/EventDispatcher'
import LoggedActionDispatcher from './actionDispatchers/LoggedActionDispatcher'
import LoggedEventDispatcher from './eventDispatchers/LoggedEventDispatcher'
import ObservableActionDispatcher from './actionDispatchers/ObservableActionDispatcher'
import React from 'react'
import ReactDOM from 'react-dom'
import connectToStore from './components/react/connectToStore'
import container from './container'
import { Authenticate } from './constants/actionTypes'

function bootstrap() {
    const eventDispatcher = new LoggedEventDispatcher(new EventDispatcher())
    const actionDispatcher = new LoggedActionDispatcher(
        new ObservableActionDispatcher(
            new ActionDispatcher(container, eventDispatcher, new ChromeBackgroundActionDispatcher())
                .mount(Authenticate, AuthenticateHandler),
            eventDispatcher
        )
    )

    const port = chrome.runtime.connect()
    port.onMessage.addListener(message => eventDispatcher.dispatch(message))

    const element = document.getElementById('app')
    return ReactDOM.render(
        <AppContext actionDispatcher={actionDispatcher} eventDispatcher={eventDispatcher}>
            <App />
        </AppContext>,
        element
    )
}

bootstrap()
