import 'regenerator/runtime'

import ActionDispatcher from './shared/dispatchers/ActionDispatcher'
import ExpandUrlHandler from './handlers/ExpandUrlHandler'
import FetchCategoriesHandler from './handlers/FetchCategoriesHandler'
import FetchContentsHandler from './handlers/FetchContentsHandler'
import FetchFullContentHandler from './handlers/FetchFullContentHandler'
import FetchSubscriptionsHandler from './handlers/FetchSubscriptionsHandler'
import FetchUnreadCountsHandler from './handlers/FetchUnreadCountsHandler'
import GetCategoriesCacheHandler from './handlers/GetCategoriesCacheHandler'
import GetCredentialHandler from './handlers/GetCredentialHandler'
import GetSubscriptionsCacheHandler from './handlers/GetSubscriptionsCacheHandler'
import GetUnreadCountsCacheHandler from './handlers/GetUnreadCountsCacheHandler'
import container from './container'
import { ExpandUrl, FetchCategories, FetchContents, FetchFullContent, FetchSubscriptions, FetchUnreadCounts, GetCategoriesCache, GetCredential, GetSubscriptionsCache, GetUnreadCountsCache } from './constants/actionTypes'
import { FromEventPatternObservable } from 'rxjs/observable/fromEventPattern'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { filter } from 'rxjs/operator/filter'
import { map } from 'rxjs/operator/map'
import { mergeMap } from 'rxjs/operator/mergeMap'

const actionDispatcher = new ActionDispatcher(container)
    .mount(ExpandUrl, ExpandUrlHandler)
    .mount(FetchCategories, FetchCategoriesHandler)
    .mount(FetchContents, FetchContentsHandler)
    .mount(FetchFullContent, FetchFullContentHandler)
    .mount(FetchSubscriptions, FetchSubscriptionsHandler)
    .mount(FetchUnreadCounts, FetchUnreadCountsHandler)
    .mount(GetCategoriesCache, GetCategoriesCacheHandler)
    .mount(GetCredential, GetCredentialHandler)
    .mount(GetSubscriptionsCache, GetSubscriptionsCacheHandler)
    .mount(GetUnreadCountsCache, GetUnreadCountsCacheHandler)

const ports = FromEventPatternObservable.create(
    ::chrome.runtime.onConnect.addListener,
    ::chrome.runtime.onConnect.removeListener
)

const messages = FromEventPatternObservable.create(
    ::chrome.runtime.onMessage.addListener,
    ::chrome.runtime.onMessage.removeListener,
    (request, sender, sendResponse) => ({ request, sender, sendResponse })
)

const portsAndMessages = ports
    ::mergeMap(port => Observable.create(subscriber => {
        const subscription = FromEventPatternObservable.create(
                ::port.onDisconnect.addListener,
                ::port.onDisconnect.removeListener
            )
            .subscribe(() => subscriber.complete())
        subscriber.add(subscription)

        messages
            ::filter(message => message.sender.tab.id === port.sender.tab.id)
            ::map(message => ({ port, message }))
            .subscribe(subscriber)

        subscriber.add(new Subscription(() => {
            port.disconnect()
        }))
    }))

portsAndMessages
    .subscribe(({ port, message }) => {
        actionDispatcher.dispatch(message.request)
            .subscribe(
                event => port.postMessage(event),
                error => message.sendResponse({ error: error ? error.toString() : null }),
                () => message.sendResponse({})
            )
    })

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'index.html' })
})
