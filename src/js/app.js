import 'regenerator/runtime'

import ActionDispatcher from './actionDispatchers/actionDispatcher'
import AuthenticateHandler from './actionHandlers/authenticateHandler'
import ChromeBackgroundActionDispatcher from './actionDispatchers/chromeBackgroundActionDispatcher'
import LoggedActionDispatcher from './actionDispatchers/loggedActionDispatcher'
import LoggedEventDispatcher from './eventDispatchers/loggedEventDispatcher'
import ObservableActionDispatcher from './actionDispatchers/observableActionDispatcher'
import ReactRenderer from './renderers/reactRenderer'
import containerProvider from './containerProvider'
import mainLoop from './mainLoop'
import storeProvider from './storeProvider'
import { Authenticate, SelectStream } from './constants/actionTypes'
import { IEventDispatcher } from './eventDispatchers/interfaces'

function bootstrap() {
    const container = containerProvider()
    const store = storeProvider()

    const eventDispatcher = new LoggedEventDispatcher(store)
    const actionDispatcher = new LoggedActionDispatcher(
        new ObservableActionDispatcher(
            new ActionDispatcher(container, eventDispatcher, new ChromeBackgroundActionDispatcher())
                .mount(Authenticate, AuthenticateHandler),
            eventDispatcher
        )
    )
    const renderer = new ReactRenderer(actionDispatcher)

    const port = chrome.runtime.connect()
    port.onMessage.addListener(::eventDispatcher.dispatch)

    const element = document.getElementById('app')
    mainLoop(element, store, ::renderer.render)
}

bootstrap()
