/// <reference path="./typings/localForage.d.ts" />

import * as localforage from 'localforage'
import AutoPagerizeContentFinder from './services/contentFinder/autoPagerizeContentFinder'
import ChainedContentFinder from './services/contentFinder/chainedContentFinder'
import ChromeWindowOpener from './services/window/chromeWindowOpener'
import Container from './di/container'
import Environment from './services/feedly/environment'
import HttpClient from './services/http/httpClient'
import LdrFullFeedContentFinder from './services/contentFinder/ldrFullFeedContentFinder'
import LocalForageCategoryRepository from './services/feedly/localForageCategoryRepository'
import LocalForageCredentialRepository from './services/feedly/localForageCredentialRepository'
import LocalForageSubscriptionRepository from './services/feedly/localForageSubscriptionRepository'
import LocalForageUnreadCountRepository from './services/feedly/localForageUnreadCountRepository'
import LocalForageWedataRepository from './services/contentFinder/localForageWedataRepository'
import SystemClock from './services/clock/systemClock'
import WedataGateway from './services/contentFinder/wedataGateway'
import { IClock } from './services/clock/interfaces'
import { IContentFinder, IWedataGateway, IWedataRepository } from './services/contentFinder/interfaces'
import { IEnvironment, ICredentialRepository, ISubscriptionRepository, IUnreadCountRepository, ICategoryRepository } from './services/feedly/interfaces'
import { IHttpClient } from './services/http/interfaces'
import { IWindowOpener } from './services/window/interfaces'
import { Inject } from './di/annotations'
import { InjectionPolicy } from './di/injectionPolicies'
import { singletonScope } from './di/scopes'

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

export default container
