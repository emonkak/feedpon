import { Action } from '../constants/actionTypes'
import { IActionDispatcher } from './interfaces'

export default class WorkerActionDispatcher implements IActionDispatcher {
    constructor(private worker: Worker) {
    }

    dispatch<A extends Action<string>>(action: A): Promise<any> {
        return new Promise((resolve, reject) => {
            const channel = new MessageChannel()

            channel.port2.onmessage = ({ data }) => {
                if ('error' in data) {
                    reject(data.error)
                } else {
                    resolve(data.result)
                }
            }

            this.worker.postMessage(action, [channel.port1])
        })
    }
}
