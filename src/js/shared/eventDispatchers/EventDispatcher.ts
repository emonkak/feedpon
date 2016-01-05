import removeFromArray from '../utils/removeFromArray'
import { Event, IEventDispatcher, Subscriber, Subscription } from '../interfaces'

export default class EventDispatcher implements IEventDispatcher {
    private _subscribers: Subscriber<any>[] = []

    dispatch<T extends Event<string>>(event: T): void {
        this._subscribers.forEach(subscriber => subscriber(event))
    }

    subscribe(subscriber: Subscriber<Event<string>>): Subscription {
        this._subscribers.push(subscriber)
        return {
            dispose: () => removeFromArray(this._subscribers, subscriber)
        }
    }
}
