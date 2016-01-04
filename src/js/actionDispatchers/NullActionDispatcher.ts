import { Action } from '../constants/actionTypes'
import { IActionDispatcher } from './interfaces'

export default class NullActionDispatcher implements IActionDispatcher {
    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        return Promise.reject<Object>(`Can not handle the "${action.actionType}" action.`)
    }
}
