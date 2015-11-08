/// <reference path="../../DefinitelyTyped/node-uuid/node-uuid-cjs.d.ts" />

import * as uuid from 'node-uuid'
import eventTypes from '../constants/eventTypes'
import { Action, IActionDispatcher } from './interfaces'

export default class RemoteActionDispatcher implements IActionDispatcher {
    constructor(private worker: Worker) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = uuid.v1()
            const handler = ({ data }) => {
                switch (data.type)  {
                case eventTypes.ACTION_DONE:
                    if (data.id === id) {
                        this.worker.removeEventListener('message', handler as any)
                        resolve(data.result)
                    }
                    break
                case eventTypes.ACTION_FAILED:
                    if (data.id === id) {
                        this.worker.removeEventListener('message', handler as any)
                        reject(data.error)
                    }
                    break
                }
            }

            this.worker.addEventListener('message', handler)
            this.worker.postMessage({ id, action })
        })
    }
}
