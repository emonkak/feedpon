/// <reference path="../../DefinitelyTyped/node-uuid/node-uuid-cjs.d.ts" />

import * as uuid from 'node-uuid'
import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class ClientActionDispatcher implements IActionDispatcher {
    constructor(private _worker: Worker) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = uuid.v1()
            const handler = ({ data }) => {
                if (data.id === id) {
                    this._worker.removeEventListener('message', handler as any)

                    data.success ? resolve(data.result) : reject(data.result)
                }
            }

            this._worker.addEventListener('message', handler)
            this._worker.postMessage({ id, action })
        })
    }
}
