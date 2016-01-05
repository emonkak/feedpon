/// <reference path="./typings/localForage.d.ts" />

import * as localforage from 'localforage'
import AutoPagerizeContentFinder from './services/contentFinder/AutoPagerizeContentFinder'
import ChainedContentFinder from './services/contentFinder/ChainedContentFinder'
import ChromeWindowOpener from './services/window/ChromeWindowOpener'
import Container from './shared/di/container'
import Environment from './services/feedly/Environment'
import HttpClient from './services/http/HttpClient'
import LdrFullFeedContentFinder from './services/contentFinder/LdrFullFeedContentFinder'
import LocalForageCategoryRepository from './services/feedly/LocalForageCategoryRepository'
import LocalForageCredentialRepository from './services/feedly/LocalForageCredentialRepository'
import LocalForageSubscriptionRepository from './services/feedly/LocalForageSubscriptionRepository'
import LocalForageUnreadCountRepository from './services/feedly/LocalForageUnreadCountRepository'
import LocalForageWedataRepository from './services/contentFinder/LocalForageWedataRepository'
import SystemClock from './services/clock/SystemClock'
import WedataGateway from './services/contentFinder/WedataGateway'
import { IClock } from './services/clock/interfaces'
import { IContainer } from './shared/di/interfaces'
import { IContentFinder, IWedataGateway, IWedataRepository } from './services/contentFinder/interfaces'
import { IEnvironment, ICredentialRepository, ISubscriptionRepository, IUnreadCountRepository, ICategoryRepository } from './services/feedly/interfaces'
import { IHttpClient } from './services/http/interfaces'
import { IWindowOpener } from './services/window/interfaces'
import { Inject } from './shared/di/annotations'
import { InjectionPolicy } from './shared/di/injectionPolicies'
import { singletonScope } from './shared/di/scopes'

class Factries {
    @Inject
    static contentFinder(ldrFullFeedContentFinder: LdrFullFeedContentFinder, autoPagerizeContentFinder: AutoPagerizeContentFinder): IContentFinder {
        return new ChainedContentFinder([
            ldrFullFeedContentFinder,
            autoPagerizeContentFinder
        ])
    }
}

const container = new Container(new InjectionPolicy(singletonScope))

container.bind(ICategoryRepository).to(LocalForageCategoryRepository)
container.bind(IClock).to(SystemClock)
container.bind(ICredentialRepository).to(LocalForageCredentialRepository)
container.bind(IHttpClient).to(HttpClient)
container.bind(ISubscriptionRepository).to(LocalForageSubscriptionRepository)
container.bind(IUnreadCountRepository).to(LocalForageUnreadCountRepository)
container.bind(IWedataGateway).to(WedataGateway)
container.bind(IWedataRepository).to(LocalForageWedataRepository)
container.bind(IWindowOpener).to(ChromeWindowOpener)

container.factory(IContentFinder, Factries.contentFinder)

container.set('LocalForage', localforage)
container.set(IEnvironment, Environment)

export default container as IContainer
