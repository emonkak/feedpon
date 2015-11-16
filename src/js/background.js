import 'regenerator/runtime'

import ActionDispatcher from './actionDispatchers/actionDispatcher'
import GetCategoriesCacheHandler from './actionHandlers/getCategoriesCacheHandler'
import GetCategoriesHandler from './actionHandlers/getCategoriesHandler'
import GetSubscriptionsCacheHandler from './actionHandlers/getSubscriptionsCacheHandler'
import GetSubscriptionsHandler from './actionHandlers/getSubscriptionsHandler'
import GetUnreadCountsCacheHandler from './actionHandlers/getUnreadCountsCacheHandler'
import GetUnreadCountsHandler from './actionHandlers/getUnreadCountsHandler'
import LoggedActionDispatcher from './actionDispatchers/loggedActionDispatcher'
import LoggedEventDispatcher from './eventDispatchers/loggedEventDispatcher'
import MessagePortEventDispatcher from './eventDispatchers/messagePortEventDispatcher'
import NullActionDispatcher from './actionDispatchers/nullActionDispatcher'
import actionTypes from './constants/actionTypes'
import container from './container'
import eventTypes from './constants/eventTypes'
import { IEventDispatcher } from './eventDispatchers/interfaces'

function handleConnect(port) {
    const eventDispatcher = new LoggedEventDispatcher(
        new MessagePortEventDispatcher(port)
    )
    const actionDispatcher = new LoggedActionDispatcher(
        new ActionDispatcher(container, eventDispatcher, new NullActionDispatcher())
            .mount(actionTypes.GET_CATEGORIES, GetCategoriesHandler)
            .mount(actionTypes.GET_CATEGORIES_CACHE, GetCategoriesCacheHandler)
            .mount(actionTypes.GET_SUBSCRIPTIONS, GetSubscriptionsHandler)
            .mount(actionTypes.GET_SUBSCRIPTIONS_CACHE, GetSubscriptionsCacheHandler)
            .mount(actionTypes.GET_UNREAD_COUNTS, GetUnreadCountsHandler)
            .mount(actionTypes.GET_UNREAD_COUNTS_CACHE, GetUnreadCountsCacheHandler)
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
