import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'

export default class LoggedActionDispatcher implements IActionDispatcher {
    constructor(private dispatcher: IActionDispatcher) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        console.log(`${action.type}: Dispatching`, action)

        return this.dispatcher.dispatch(action)
            .then(result => {
                console.log(`${action.type}: Done`, result)
                return result
            })
            .catch(error => {
                console.error(`${action.type} Failed`, error)
                return Promise.reject(error)
            })
    }
}
