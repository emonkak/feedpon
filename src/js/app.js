import 'regenerator/runtime'

import ActionDispatcher from './shared/actionDispatchers/ActionDispatcher'
import App from './components/react/App'
import AppContext from './components/react/AppContext'
import AuthenticateHandler from './actionHandlers/AuthenticateHandler'
import ChromeBackgroundActionDispatcher from './shared/actionDispatchers/ChromeBackgroundActionDispatcher'
import EventDispatcher from './shared/eventDispatchers/EventDispatcher'
import LoggedActionDispatcher from './shared/actionDispatchers/LoggedActionDispatcher'
import LoggedEventDispatcher from './shared/eventDispatchers/LoggedEventDispatcher'
import ObservableActionDispatcher from './shared/actionDispatchers/ObservableActionDispatcher'
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
