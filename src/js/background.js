import 'regenerator/runtime'

import ActionDispatcher from './actionDispatchers/actionDispatcher'
import GetCategoriesCacheHandler from './actionHandlers/getCategoriesCacheHandler'
import GetCategoriesHandler from './actionHandlers/getCategoriesHandler'
import GetCredentialHandler from './actionHandlers/getCredentialHandler'
import GetFullContentHandler from './actionHandlers/getFullContentHandler'
import GetSubscriptionsCacheHandler from './actionHandlers/getSubscriptionsCacheHandler'
import GetSubscriptionsHandler from './actionHandlers/getSubscriptionsHandler'
import GetUnreadCountsCacheHandler from './actionHandlers/getUnreadCountsCacheHandler'
import GetUnreadCountsHandler from './actionHandlers/getUnreadCountsHandler'
import LoggedActionDispatcher from './actionDispatchers/loggedActionDispatcher'
import LoggedEventDispatcher from './eventDispatchers/loggedEventDispatcher'
import MessagePortEventDispatcher from './eventDispatchers/messagePortEventDispatcher'
import NullActionDispatcher from './actionDispatchers/nullActionDispatcher'
import SelectStreamHandler from './actionHandlers/selectStreamHandler'
import containerProvider from './containerProvider'
import { GetCategories, GetCategoriesCache, GetCredential, GetFullContent, GetSubscriptions, GetSubscriptionsCache, GetUnreadCounts, GetUnreadCountsCache, SelectStream } from './constants/actionTypes'
import { IEventDispatcher } from './eventDispatchers/interfaces'

function handleConnect(port) {
    const container = containerProvider()

    const eventDispatcher = new LoggedEventDispatcher(
        new MessagePortEventDispatcher(port)
    )
    const actionDispatcher = new LoggedActionDispatcher(
        new ActionDispatcher(container, eventDispatcher, new NullActionDispatcher())
            .mount(GetCategories, GetCategoriesHandler)
            .mount(GetCategoriesCache, GetCategoriesCacheHandler)
            .mount(GetCredential, GetCredentialHandler)
            .mount(GetFullContent, GetFullContentHandler)
            .mount(GetSubscriptions, GetSubscriptionsHandler)
            .mount(GetSubscriptionsCache, GetSubscriptionsCacheHandler)
            .mount(GetUnreadCounts, GetUnreadCountsHandler)
            .mount(GetUnreadCountsCache, GetUnreadCountsCacheHandler)
            .mount(SelectStream, SelectStreamHandler),
    )

    chrome.runtime.onMessage.addListener(handleMessage)
    port.onDisconnect.addListener(handleDisconnect)

    function handleMessage(request, sender, sendResponse) {
        actionDispatcher.dispatch(request)
            .then(result => sendResponse({ result }))
            .catch(error => sendResponse({ error }))
        return true
    }

    function handleDisconnect(port) {
        port.onDisconnect.removeListener(handleDisconnect)
        chrome.runtime.onMessage.removeListener(handleMessage)
    }
}

chrome.runtime.onConnect.addListener(handleConnect)
chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'index.html' })
})
