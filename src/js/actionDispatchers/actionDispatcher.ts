import { Action } from '../constants/actionTypes'
import { IActionDispatcher } from './interfaces'
import { IActionHandler, IActionHandlerClass } from '../actionHandlers/interfaces'
import { IContainer } from '../di/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'

export default class ActionDispatcher implements IActionDispatcher {
    private handlerClasses: { [key: string]: IActionHandlerClass<Action<any>, any> } = {}

    constructor(private container: IContainer,
                private eventDispatcher: IEventDispatcher,
                private fallback: IActionDispatcher) {
    }

    mount<A extends Action<any>, R>(actionType: string, handlerClass: IActionHandlerClass<A, R>): ActionDispatcher {
        this.handlerClasses[actionType] = handlerClass
        return this
    }

    dispatch<A extends Action<any>>(action: A): Promise<any> {
        const { actionType } = action
        const handlerClass = this.handlerClasses[actionType]
        if (handlerClass) {
            const handler = this.container.get(handlerClass)
            return handler.handle(action, this.eventDispatcher)
        }
        return this.fallback.dispatch(action)
    }
}
