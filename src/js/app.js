import App from './components/app'
import AppContainer from './components/appContainer'
import ClientActionDispatcher from './actions/clientActionDispatcher'
import EmittableActionDispatcher from './actions/emittableActionDispatcher'
import React from 'react'
import ReactDOM from 'react-dom'
import actionTypes from './constants/actionTypes'
import channelsFactory from './channelsFactory'
import { EventEmitter } from 'events'

const worker = new Worker('worker.js')
const eventEmitter = new EventEmitter()
const dispatcher = new EmittableActionDispatcher(new ClientActionDispatcher(worker), eventEmitter)
const channels = channelsFactory(eventEmitter)

ReactDOM.render(
    <AppContainer dispatcher={dispatcher} channels={channels}>
        <App />
    </AppContainer>,
    document.getElementById('app')
)
