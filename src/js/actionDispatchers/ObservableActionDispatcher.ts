import { Action } from '../constants/actionTypes'
import { ActionDone, ActionFailed } from '../constants/eventTypes'
import { IActionDispatcher } from './interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'

export default class ObservableActionDispatcher implements IActionDispatcher {
    constructor(private dispatcher: IActionDispatcher,
                private eventDispatcher: IEventDispatcher) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        return this.dispatcher.dispatch(action)
            .then(result => {
                this.eventDispatcher.dispatch<ActionDone>({ eventType: ActionDone, action, result })
                return result
            })
            .catch(error => {
                this.eventDispatcher.dispatch<ActionFailed>({ eventType: ActionFailed, action, error })
                return Promise.reject(error)
            })
    }
}
