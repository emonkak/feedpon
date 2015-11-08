import ActionDispatcher from './dispatchers/actionDispatcher'
import App from './components/app'
import AppContainer from './components/appContainer'
import AuthenticateHandler from './handlers/authenticateHandler'
import EmittableActionDispatcher from './dispatchers/emittableActionDispatcher'
import LoggedActionDispatcher from './dispatchers/loggedActionDispatcher'
import React from 'react'
import ReactDOM from 'react-dom'
import WorkerActionDispatcher from './dispatchers/workerActionDispatcher'
import actionTypes from './constants/actionTypes'
import container from './container'
import { EventEmitter } from 'events'

function bootstrap() {
    const worker = new Worker('assets/worker.js')
    const eventEmitter = new EventEmitter()
    const dispatcher = new LoggedActionDispatcher(
        new EmittableActionDispatcher(
            new ActionDispatcher(new WorkerActionDispatcher(worker), container)
                .mount(actionTypes.AUTHENTICATE, AuthenticateHandler),
            eventEmitter
        )
    )
    ReactDOM.render(
        <AppContainer dispatcher={dispatcher} eventEmitter={eventEmitter}>
            <App />
        </AppContainer>,
        document.getElementById('app')
    )
}

if ('cordova' in window) {
    document.addEventListener('deviceready', bootstrap, false);
} else {
    bootstrap()
}
