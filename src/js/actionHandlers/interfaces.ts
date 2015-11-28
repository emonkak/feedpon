import { Action } from '../constants/actionTypes'
import { IEventDispatcher } from '../eventDispatchers/interfaces'

export interface IActionHandler<T extends Action<any>, U> {
    handle(action: T, eventDispatcher: IEventDispatcher): Promise<U>
}

export interface IActionHandlerClass<T extends Action<any>, U> {
    new(...args: any[]): IActionHandler<T, U>
}

