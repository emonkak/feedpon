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
import createContainer from './createContainer'
import createStore from './createStore'
import { Authenticate, SelectStream } from './constants/actionTypes'

function bootstrap() {
    const container = createContainer()
    const store = createStore()

    const eventDispatcher = new LoggedEventDispatcher(store)
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
        <AppContext actionDispatcher={actionDispatcher}>
            {React.createElement(connectToStore(App, store))}
        </AppContext>,
        element
    )
}

bootstrap()
