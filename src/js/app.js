import ActionDispatcher from './actions/actionDispatcher'
import App from './components/app'
import AppContainer from './components/appContainer'
import AuthActionHandler from './actions/authActionHandler'
import Container from './di/container'
import React from 'react'
import ReactDOM from 'react-dom'
import { DefaultInjectionPolicy } from './di/injection-policies'
import { EventEmitter } from 'events'

const eventEmitter = new EventEmitter()
eventEmitter.on('count', console.log.bind(console))

const container = new Container(new DefaultInjectionPolicy())
container.set(EventEmitter, eventEmitter)

const dispatcher = new ActionDispatcher(container, eventEmitter)
    .mount('count', AuthActionHandler)

ReactDOM.render(
    <AppContainer dispatcher={dispatcher} eventEmitter={eventEmitter}>
        <App name="Yui Kaori" />
    </AppContainer>,
    document.getElementById('app')
)
