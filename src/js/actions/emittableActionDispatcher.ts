/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />

import actionTypes from '../constants/actionTypes'
import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'
import { EventEmitter } from 'events'
import { Inject } from '../di/annotations'

@Inject
export default class EmittableActionDispatcher implements IActionDispatcher {
    constructor(private _dispatcher: IActionDispatcher, private _eventEmitter: EventEmitter) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        return this._dispatcher.dispatch(action)
            .then(result => {
                this._eventEmitter.emit(action.type, result)
                return result
            })
            .catch(error => {
                this._eventEmitter.emit(actionTypes.ERROR, { action, error })
                return Promise.reject(error)
            })
    }
}
