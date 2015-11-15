/// <reference path="./typings/localForage.d.ts" />

import * as localforage from 'localforage'
import ChromeWindowOpener from './services/window/chromeWindowOpener'
import Container from './di/container'
import Environment from './services/feedly/environment'
import HttpClient from './services/http/httpClient'
import LocalForageCategoryRepository from './repositories/localForageCategoryRepository'
import LocalForageCredentialRepository from './repositories/localForageCredentialRepository'
import LocalForageSubscriptionRepository from './repositories/localForageSubscriptionRepository'
import LocalForageUnreadCountRepository from './repositories/localForageUnreadCountRepository'
import SystemClock from './services/clock/systemClock'
import { IClock } from './services/clock/interfaces'
import { ICredentialRepository, ISubscriptionRepository, IUnreadCountRepository, ICategoryRepository } from './repositories/interfaces'
import { IEnvironment } from './services/feedly/interfaces'
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
