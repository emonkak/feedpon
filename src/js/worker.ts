/// <reference path="./typings/localForage.d.ts" />

import * as localforage from 'localforage'
import Authenticator from './services/feedly/authenticator'
import Container from './di/container'
import Environment from './services/feedly/environment'
import HttpClient from './services/http/httpClient'
import IdentityActionHandler from './actions/identityActionHandler'
import ServerActionDispatcher from './actions/serverActionDispatcher'
import SystemClock from './services/clock/systemClock'
import WindowOpenerOnChrome from './services/window/windowOpenerOnChrome'
import actionTypes from './constants/actionTypes'
import { DefaultInjectionPolicy } from './di/injectionPolicies'
import { IClock } from './services/clock/interfaces'
import { IEnvironment } from './services/feedly/interfaces'
import { IHttpClient } from './services/http/interfaces'
import { IWindowOpener } from './services/window/interfaces'

function app(worker: Worker) {
    const container = new Container(new DefaultInjectionPolicy())
    container.bind(IHttpClient).to(HttpClient)
    container.bind(IClock).to(SystemClock)
    container.bind(IWindowOpener).to(WindowOpenerOnChrome)
    container.set(IEnvironment, Environment)
    container.set('LocalForage', localforage)

    const dispatcher = new ServerActionDispatcher(container)
        .mount(actionTypes.COUNT, IdentityActionHandler)

    worker.onmessage = ({ data }) => {
        const { id, action } = data

        dispatcher.dispatch(action)
            .then(result => worker.postMessage({ id, result, success: true }))
            .catch(result => worker.postMessage({ id, result, success: false }))
    }
}

app(self as any)
