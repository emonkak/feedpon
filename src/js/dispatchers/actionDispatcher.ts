import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'

export default class ActionDispatcher implements IActionDispatcher {
    private handlerClasses: Map<string, IActionHandlerClass<Action<string>, any>> = new Map()

    constructor(private dispatcher: IActionDispatcher,
                private container: IContainer) {
    }

    mount<A extends Action<string>, R>(type: string, handlerClass: IActionHandlerClass<A, R>): IActionDispatcher {
        this.handlerClasses.set(type, handlerClass)
        return this
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        const actionType = action.type
        const handlerClass = this.handlerClasses.get(actionType)
        if (handlerClass) {
            const handler = this.container.get(handlerClass)
            return handler.handle(action)
        }
        return this.dispatcher.dispatch(action)
    }
}
