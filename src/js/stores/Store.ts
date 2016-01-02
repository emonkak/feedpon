import { Event, Subscriber, Subscription } from '../eventDispatchers/interfaces'
import { IStore, Reducer } from './interfaces'
import removeFromArray from '../utils/removeFromArray'

export default class Store<T> implements IStore<T> {
    private _subscribers: Subscriber<T>[] = []

    constructor(private _reducer: Reducer<T, Event<string>>,
                private _state: T) {
    }

    getState(): T {
        return this._state
    }

    setState(state: T): void {
        this._state = state
        this._subscribers.forEach(subscriber => subscriber(state))
    }

    dispatch<T extends Event<string>>(event: T): void {
        const newState = this._reducer(this._state, event)
        this.setState(newState)
    }

    subscribe(subscriber: Subscriber<T>): Subscription {
        this._subscribers.push(subscriber)

        return {
            dispose: () => { removeFromArray(this._subscribers, subscriber) }
        }
    }
}
