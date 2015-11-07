/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />

import actionTypes from '../constants/actionTypes'
import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'
import { EventEmitter } from 'events'

export default class EmittableActionDispatcher implements IActionDispatcher {
    constructor(private dispatcher: IActionDispatcher,
                private eventEmitter: EventEmitter) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        return this.dispatcher.dispatch(action)
            .then(result => {
                this.eventEmitter.emit(action.type, result)
                return result
            })
            .catch(error => {
                this.eventEmitter.emit(actionTypes.ERROR, { action, error })
                return Promise.reject(error)
            })
    }
}
