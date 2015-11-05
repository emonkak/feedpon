import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'
import { IContainer } from '../di/interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class ServerActionDispatcher implements IActionDispatcher {
    private _handlerClasses: Map<string, IActionHandlerClass<Action<string>, any>> = new Map()

    constructor(private _container: IContainer) {
    }

    mount<A extends Action<string>, R>(type: string, handlerClass: IActionHandlerClass<A, R>): IActionDispatcher {
        this._handlerClasses.set(type, handlerClass)
        return this
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        const actionType = action.type
        const handlerClass = this._handlerClasses.get(actionType)
        if (handlerClass) {
            const handler = this._container.get(handlerClass)
            return handler.handle(action)
        }
        return Promise.reject<Object>(`Can not dispatch "${actionType}" action because the action dispatcher is not found.`)
    }
}
