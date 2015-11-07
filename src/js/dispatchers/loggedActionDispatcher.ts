import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'

export default class LoggedActionDispatcher implements IActionDispatcher {
    constructor(private dispatcher: IActionDispatcher) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        console.log('Dispatching action...', action)

        return this.dispatcher.dispatch(action)
            .then(result => {
                console.log('Dispatched action is successful', result)
                return result
            })
            .catch(error => {
                console.error('Dispatched action is failure', error)
                return Promise.reject(error)
            })
    }
}
