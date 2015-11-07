/// <reference path="../../DefinitelyTyped/node-uuid/node-uuid-cjs.d.ts" />

import * as uuid from 'node-uuid'
import { Action, IActionDispatcher, IActionHandler, IActionHandlerClass } from './interfaces'

export default class WorkerActionDispatcher implements IActionDispatcher {
    constructor(private worker: Worker) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<Object> {
        return new Promise((resolve, reject) => {
            const id = uuid.v1()
            const handler = ({ data }) => {
                if (data.id === id) {
                    this.worker.removeEventListener('message', handler as any)

                    data.success ? resolve(data.result) : reject(data.result)
                }
            }

            this.worker.addEventListener('message', handler)
            this.worker.postMessage({ id, action })
        })
    }
}
