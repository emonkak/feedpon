import 'regenerator/runtime'

import ActionDispatcher from './actionDispatchers/ActionDispatcher'
import ChromePortEventDispatcher from './eventDispatchers/ChromePortEventDispatcher'
import GetCategoriesCacheHandler from './actionHandlers/GetCategoriesCacheHandler'
import GetCategoriesHandler from './actionHandlers/GetCategoriesHandler'
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
import createContainer from './createContainer'
import { GetCategories, GetCategoriesCache, GetCredential, GetFullContent, GetSubscriptions, GetSubscriptionsCache, GetUnreadCounts, GetUnreadCountsCache, SelectStream } from './constants/actionTypes'
import { IEventDispatcher } from './eventDispatchers/interfaces'

function handleConnect(port) {
    const container = createContainer()

    const eventDispatcher = new LoggedEventDispatcher(
        new ChromePortEventDispatcher(port)
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
