import { Action } from '../constants/actionTypes'
import { IActionDispatcher } from './interfaces'

export default class LoggedActionDispatcher implements IActionDispatcher {
    constructor(private actionDispatcher: IActionDispatcher) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        console.log(action)

        return this.actionDispatcher.dispatch(action)
    }
}
