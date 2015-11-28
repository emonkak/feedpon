import { Action } from '../constants/actionTypes'

export interface IActionDispatcher {
    dispatch<T extends Action<string>>(action: T): Promise<any>
}
