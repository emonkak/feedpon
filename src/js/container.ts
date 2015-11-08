/// <reference path="./typings/localForage.d.ts" />

import * as localforage from 'localforage'
import ChromeWindowOpener from './services/window/chromeWindowOpener'
import Container from './di/container'
import Environment from './services/feedly/environment'
import HttpClient from './services/http/httpClient'
import LocalForageCredentialRepository from './repositories/localForageCredentialRepository'
import SystemClock from './services/clock/systemClock'
import { IClock } from './services/clock/interfaces'
import { ICredentialRepository } from './repositories/interfaces'
import { IEnvironment } from './services/feedly/interfaces'
import { IHttpClient } from './services/http/interfaces'
import { IWindowOpener } from './services/window/interfaces'
import { InjectionPolicy } from './di/injectionPolicies'
import { singletonScope } from './di/scopes'

const container = new Container(new InjectionPolicy(singletonScope))
container.bind(IClock).to(SystemClock)
container.bind(ICredentialRepository).to(LocalForageCredentialRepository)
container.bind(IHttpClient).to(HttpClient)
container.bind(IWindowOpener).to(ChromeWindowOpener)
container.set('LocalForage', localforage)
container.set(IEnvironment, Environment)

export default container
