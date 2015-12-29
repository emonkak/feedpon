import { Event, IEventDispatcher } from './interfaces'

export default class MessagePortEventDispatcher implements IEventDispatcher {
    constructor(private port: { postMessage: (message: any) => void }) {
    }

    dispatch<T extends Event<string>>(event: T): void {
        this.port.postMessage(event)
    }
}
