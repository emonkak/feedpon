import { Event, IEventDispatcher } from './interfaces'

export default class WorkerEventDispatcher implements IEventDispatcher {
    constructor(private worker: Worker) {
    }

    dispatch<T extends Event<string>>(event: T): void {
        this.worker.postMessage(event)
    }
}
