import ActionDispatcher from './dispatchers/actionDispatcher'
import IdentityActionHandler from './handlers/identityActionHandler'
import NullActionDispatcher from './dispatchers/nullActionDispatcher'
import actionTypes from './constants/actionTypes'
import container from './container'

function bootstrap(worker: Worker) {
    const dispatcher = new ActionDispatcher(new NullActionDispatcher(), container)

    worker.onmessage = ({ data }) => {
        const { id, action } = data

        dispatcher.dispatch(action)
            .then(result => worker.postMessage({ id, result, success: true }))
            .catch(result => worker.postMessage({ id, result, success: false }))
    }
}

bootstrap(self as any)
