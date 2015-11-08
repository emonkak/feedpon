import eventTypes from '../constants/eventTypes'
import { Action, IActionDispatcher } from './interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'

export default class ObservableActionDispatcher implements IActionDispatcher {
    constructor(private dispatcher: IActionDispatcher,
                private eventDispatcher: IEventDispatcher) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        return this.dispatcher.dispatch(action)
            .then(result => {
                this.eventDispatcher.dispatch({ eventType: eventTypes.ACTION_DONE, action, result })
                return result
            })
            .catch(error => {
                this.eventDispatcher.dispatch({ eventType: eventTypes.ACTION_FAILED, action, error })
                return Promise.reject(error)
            })
    }
}
