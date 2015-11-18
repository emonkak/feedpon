/// <reference path="./typings/localForage.d.ts" />

import * as localforage from 'localforage'
import ChromeWindowOpener from './services/window/chromeWindowOpener'
import Container from './di/container'
import Environment from './services/feedly/environment'
import HttpClient from './services/http/httpClient'
import LocalForageCategoryRepository from './services/feedly/localForageCategoryRepository'
import LocalForageCredentialRepository from './services/feedly/localForageCredentialRepository'
import LocalForageSubscriptionRepository from './services/feedly/localForageSubscriptionRepository'
import LocalForageUnreadCountRepository from './services/feedly/localForageUnreadCountRepository'
import SystemClock from './services/clock/systemClock'
import { IClock } from './services/clock/interfaces'
import { IEnvironment, ICredentialRepository, ISubscriptionRepository, IUnreadCountRepository, ICategoryRepository } from './services/feedly/interfaces'
import { IHttpClient } from './services/http/interfaces'
import { IWindowOpener } from './services/window/interfaces'
import { InjectionPolicy } from './di/injectionPolicies'
import { singletonScope } from './di/scopes'

const container = new Container(new InjectionPolicy(singletonScope))
container.bind(ICategoryRepository).to(LocalForageCategoryRepository)
container.bind(IClock).to(SystemClock)
container.bind(ICredentialRepository).to(LocalForageCredentialRepository)
container.bind(IHttpClient).to(HttpClient)
container.bind(ISubscriptionRepository).to(LocalForageSubscriptionRepository)
container.bind(IUnreadCountRepository).to(LocalForageUnreadCountRepository)
container.bind(IWindowOpener).to(ChromeWindowOpener)
container.set('LocalForage', localforage)
container.set(IEnvironment, Environment)

export default container
