import ActionDispatcher from './actionDispatchers/actionDispatcher'
import GetCategoriesHandler from './actionHandlers/getCategoriesHandler'
import GetSubscriptionsHandler from './actionHandlers/getSubscriptionsHandler'
import GetUnreadCountsHandler from './actionHandlers/getUnreadCountsHandler'
import NullActionDispatcher from './actionDispatchers/nullActionDispatcher'
import MessagePortEventDispatcher from './eventDispatchers/messagePortEventDispatcher'
import actionTypes from './constants/actionTypes'
import container from './container'
import eventTypes from './constants/eventTypes'
import { IEventDispatcher } from './eventDispatchers/interfaces'

function handleConnect(port) {
    const eventDispatcher = new MessagePortEventDispatcher(port)
    const actionDispatcher = new ActionDispatcher(container, new NullActionDispatcher())
        .mount(actionTypes.GET_CATEGORIES, GetCategoriesHandler)
        .mount(actionTypes.GET_SUBSCRIPTIONS, GetSubscriptionsHandler)
        .mount(actionTypes.GET_UNREAD_COUNTS, GetUnreadCountsHandler)

    container.set(IEventDispatcher, eventDispatcher)

    chrome.extension.onMessage.addListener(handleMessage)

    port.onDisconnect.addListener(handleDisconnect)

    function handleMessage(request, sender, sendResponse) {
        const response = actionDispatcher.dispatch(request)
            .then(result => sendResponse({ result }))
            .catch(error => sendResponse({ error }))
    }

    function handleDisconnect(port) {
        port.onDisconnect.removeListener(disconnect)
        chrome.extension.onRequest.removeListener(handleMessage)
    }
}

chrome.extension.onConnect.addListener(handleConnect)
chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'index.html' })
})
