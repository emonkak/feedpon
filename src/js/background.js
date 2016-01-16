import 'regenerator/runtime'

import ActionDispatcher from './shared/dispatchers/ActionDispatcher'
import FetchCategoriesHandler from './handlers/FetchCategoriesHandler'
import FetchContentsHandler from './handlers/FetchContentsHandler'
import FetchFullContentHandler from './handlers/FetchFullContentHandler'
import FetchSubscriptionsHandler from './handlers/FetchSubscriptionsHandler'
import FetchUnreadCountsHandler from './handlers/FetchUnreadCountsHandler'
import GetCategoriesCacheHandler from './handlers/GetCategoriesCacheHandler'
import GetCredentialHandler from './handlers/GetCredentialHandler'
import GetSubscriptionsCacheHandler from './handlers/GetSubscriptionsCacheHandler'
import GetUnreadCountsCacheHandler from './handlers/GetUnreadCountsCacheHandler'
import ExpandUrlHandler from './handlers/ExpandUrlHandler'
import container from './container'
import { ExpandUrl, FetchCategories, FetchContents, FetchFullContent, FetchSubscriptions, FetchUnreadCounts, GetCategoriesCache, GetCredential, GetSubscriptionsCache, GetUnreadCountsCache } from './constants/actionTypes'

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

function handleConnect(port) {
    chrome.runtime.onMessage.addListener(handleMessage)
    port.onDisconnect.addListener(handleDisconnect)

    function handleMessage(request, sender, sendResponse) {
        actionDispatcher.dispatch(request)
            .subscribe(
                event => port.postMessage(event),
                error => sendResponse({ error: error ? error.toString() : null }),
                () => sendResponse({})
            )
        return true
    }

    function handleDisconnect(port) {
        chrome.runtime.onMessage.removeListener(handleMessage)
        port.onDisconnect.removeListener(handleDisconnect)
    }
}

chrome.runtime.onConnect.addListener(handleConnect)
chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'index.html' })
})
