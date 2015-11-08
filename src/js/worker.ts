import ActionDispatcher from './actionDispatchers/actionDispatcher'
import GetSubscriptionsHandler from './actionHandlers/getSubscriptionsHandler'
import NullActionDispatcher from './actionDispatchers/nullActionDispatcher'
import WorkerEventDispatcher from './eventDispatchers/workerEventDispatcher'
import actionTypes from './constants/actionTypes'
import container from './container'
import eventTypes from './constants/eventTypes'
import { IEventDispatcher } from './eventDispatchers/interfaces'

function bootstrap(worker: Worker) {
    const eventDispatcher = new WorkerEventDispatcher(worker)
    const actionDispatcher = new ActionDispatcher(container, new NullActionDispatcher())
        .mount(actionTypes.GET_SUBSCRIPTIONS, GetSubscriptionsHandler)

    container.set(IEventDispatcher, eventDispatcher)

    worker.onmessage = ({ data }) => {
        const { id, action } = data

        actionDispatcher.dispatch(action)
            .then(result => eventDispatcher.dispatch({ eventType: eventTypes.ACTION_DONE, id, action, result }))
            .catch(error => eventDispatcher.dispatch({ eventType: eventTypes.ACTION_FAILED, id, action, error }))
    }
}

bootstrap(self as any)
