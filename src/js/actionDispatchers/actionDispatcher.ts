import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'
import { IContainer } from '../di/interfaces'

export default class ActionDispatcher implements IActionDispatcher {
    private handlerClasses: Map<string, IActionHandlerClass<Action<any>, any>> = new Map()

    constructor(private container: IContainer,
                private fallback: IActionDispatcher) {
    }

    mount<A extends Action<any>, R>(actionType: string, handlerClass: IActionHandlerClass<A, R>): IActionDispatcher {
        this.handlerClasses.set(actionType, handlerClass)
        return this
    }

    dispatch<A extends Action<any>>(action: A): Promise<any> {
        const { actionType } = action
        const handlerClass = this.handlerClasses.get(actionType)
        if (handlerClass) {
            const handler = this.container.get(handlerClass)
            return handler.handle(action)
        }
        return this.fallback.dispatch(action)
    }
}
