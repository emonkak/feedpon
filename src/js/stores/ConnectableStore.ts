import { Event, Subscriber, Subscription, ISubscribable } from '../eventDispatchers/interfaces'
import { IStore } from './interfaces'

export default class ConnectableStore<T> implements IStore<T> {
    private _connection: Subscription

    private _refCount: number = 0

    constructor(private _store: IStore<T>,
                private _subscribable: ISubscribable<Event<string>>) {
    }

    getState(): T {
        return this._store.getState()
    }

    setState(state: T): void {
        return this._store.setState(state)
    }

    dispatch<T extends Event<string>>(event: T): void {
        return this._store.dispatch(event)
    }

    subscribe(subscriber: Subscriber<T>): Subscription {
        const subscription = this._store.subscribe(subscriber)

        this._refCount++

        if (this._refCount === 1) {
            this._connection = this._subscribable.subscribe(event => this.dispatch(event))
        }

        let disposed = false

        return {
            dispose: () => {
                if (!disposed) {
                    disposed = true
                    this._refCount--
                    subscription.dispose()
                    if (this._refCount === 0) this._connection.dispose()
                }
            }
        }
    }
}
