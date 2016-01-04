import 'regenerator/runtime'

import ActionDispatcher from './actionDispatchers/ActionDispatcher'
import EventDispatcher from './eventDispatchers/EventDispatcher'
import GetCategoriesCacheHandler from './actionHandlers/GetCategoriesCacheHandler'
import GetCategoriesHandler from './actionHandlers/GetCategoriesHandler'
import GetContentsHandler from './actionHandlers/GetContentsHandler'
import GetCredentialHandler from './actionHandlers/GetCredentialHandler'
import GetFullContentHandler from './actionHandlers/GetFullContentHandler'
import GetSubscriptionsCacheHandler from './actionHandlers/GetSubscriptionsCacheHandler'
import GetSubscriptionsHandler from './actionHandlers/GetSubscriptionsHandler'
import GetUnreadCountsCacheHandler from './actionHandlers/GetUnreadCountsCacheHandler'
import GetUnreadCountsHandler from './actionHandlers/GetUnreadCountsHandler'
import LoggedActionDispatcher from './actionDispatchers/LoggedActionDispatcher'
import LoggedEventDispatcher from './eventDispatchers/LoggedEventDispatcher'
import NullActionDispatcher from './actionDispatchers/NullActionDispatcher'
import SelectStreamHandler from './actionHandlers/SelectStreamHandler'
import container from './container'
import { GetCategories, GetCategoriesCache, GetContents, GetCredential, GetFullContent, GetSubscriptions, GetSubscriptionsCache, GetUnreadCounts, GetUnreadCountsCache } from './constants/actionTypes'
import { IEventDispatcher } from './eventDispatchers/interfaces'

const eventDispatcher = new LoggedEventDispatcher(new EventDispatcher())
const actionDispatcher = new LoggedActionDispatcher(
    new ActionDispatcher(container, eventDispatcher, new NullActionDispatcher())
        .mount(GetCategories, GetCategoriesHandler)
        .mount(GetCategoriesCache, GetCategoriesCacheHandler)
        .mount(GetContents, GetContentsHandler)
        .mount(GetCredential, GetCredentialHandler)
        .mount(GetFullContent, GetFullContentHandler)
        .mount(GetSubscriptions, GetSubscriptionsHandler)
        .mount(GetSubscriptionsCache, GetSubscriptionsCacheHandler)
        .mount(GetUnreadCounts, GetUnreadCountsHandler)
        .mount(GetUnreadCountsCache, GetUnreadCountsCacheHandler)
)

function handleConnect(port) {
    const subscription = eventDispatcher.subscribe(handleEvent)
    chrome.runtime.onMessage.addListener(handleMessage)
    port.onDisconnect.addListener(handleDisconnect)

    function handleEvent(event) {
        port.postMessage(event)
    }

    function handleMessage(request, sender, sendResponse) {
        actionDispatcher.dispatch(request)
            .then(result => sendResponse({ result, success: true }))
            .catch(error => sendResponse({ result: error, success: false }))
        return true
    }

    function handleDisconnect(port) {
        subscription.dispose()
        port.onDisconnect.removeListener(handleDisconnect)
        chrome.runtime.onMessage.removeListener(handleMessage)
    }
}

chrome.runtime.onConnect.addListener(handleConnect)
chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'index.html' })
})
