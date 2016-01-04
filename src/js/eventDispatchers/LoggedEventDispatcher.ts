import { Event, IEventDispatcher, Subscriber, Subscription } from './interfaces'

export default class LoggedEventDispatcher implements IEventDispatcher {
    constructor(private eventDispatcher: IEventDispatcher) {
    }

    dispatch<T extends Event<string>>(event: T): void {
        console.log(event)
        this.eventDispatcher.dispatch(event)
    }

    subscribe(subscriber: Subscriber<Event<string>>): Subscription {
        return this.eventDispatcher.subscribe(subscriber)
    }
}
