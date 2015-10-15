/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />

import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'
import { EventEmitter } from 'events'
import { IContainer } from '../di/interfaces'

export default class ActionDispatcher<T> implements IActionDispatcher<T> {
    private _handlerClasses: Map<T, IActionHandlerClass<any, any>> = new Map()

    constructor(private _container: IContainer, private _eventEmitter: EventEmitter) {
    }

    mount<A extends Action<T>, R>(type: T, handlerClass: IActionHandlerClass<A, R>): IActionDispatcher<T> {
        this._handlerClasses.set(type, handlerClass)
        return this
    }

    dispatch<A extends Action<T>>(action: A): Promise<void> {
        const actionType = action.type as any
        const handlerClass = this._handlerClasses.get(actionType)
        if (handlerClass) {
            const handler = this._container.get(handlerClass)
            return handler.handle(action)
                .then(response => this._eventEmitter.emit(actionType, response))
                .then(() => Promise.resolve())
        }
        return Promise.reject('The handler class is not found.')
    }
}
