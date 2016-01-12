import 'regenerator/runtime'

import ActionDispatcher from './shared/dispatchers/ActionDispatcher'
import GetCategoriesCacheHandler from './handlers/GetCategoriesCacheHandler'
import GetCategoriesHandler from './handlers/GetCategoriesHandler'
import GetContentsHandler from './handlers/GetContentsHandler'
import GetCredentialHandler from './handlers/GetCredentialHandler'
import GetFullContentHandler from './handlers/GetFullContentHandler'
import GetSubscriptionsCacheHandler from './handlers/GetSubscriptionsCacheHandler'
import GetSubscriptionsHandler from './handlers/GetSubscriptionsHandler'
import GetUnreadCountsCacheHandler from './handlers/GetUnreadCountsCacheHandler'
import GetUnreadCountsHandler from './handlers/GetUnreadCountsHandler'
import container from './container'
import { GetCategories, GetCategoriesCache, GetContents, GetCredential, GetFullContent, GetSubscriptions, GetSubscriptionsCache, GetUnreadCounts, GetUnreadCountsCache } from './constants/actionTypes'

const actionDispatcher = new ActionDispatcher(container)
    .mount(GetCategories, GetCategoriesHandler)
    .mount(GetCategoriesCache, GetCategoriesCacheHandler)
    .mount(GetContents, GetContentsHandler)
    .mount(GetCredential, GetCredentialHandler)
    .mount(GetFullContent, GetFullContentHandler)
    .mount(GetSubscriptions, GetSubscriptionsHandler)
    .mount(GetSubscriptionsCache, GetSubscriptionsCacheHandler)
    .mount(GetUnreadCounts, GetUnreadCountsHandler)
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
