import ActionDispatcher from './dispatchers/actionDispatcher'
import GetSubscriptionsHandler from './handlers/getSubscriptionsHandler'
import NullActionDispatcher from './dispatchers/nullActionDispatcher'
import actionTypes from './constants/actionTypes'
import container from './container'

function bootstrap(worker: Worker) {
    const dispatcher = new ActionDispatcher(new NullActionDispatcher(), container)
        .mount(actionTypes.GET_SUBSCRIPTIONS, GetSubscriptionsHandler)

    worker.onmessage = ({ data }) => {
        const { id, action } = data

        dispatcher.dispatch(action)
            .then(result => worker.postMessage({ id, result, success: true }))
            .catch(result => {
                console.log(result)
                worker.postMessage({ id, result, success: false })
            })
    }
}

bootstrap(self as any)
