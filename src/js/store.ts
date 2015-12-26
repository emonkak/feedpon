import { Event, IEventDispatcher } from './eventDispatchers/interfaces'

type Reducer<T> = (state: T, event: any) => T
type Subscriber<T> = (state: T) => void

export default class Store<T> implements IEventDispatcher {
    private _reducers: { [key: string]: Reducer<T> } = {}

    private _subscripbers: Set<Subscriber<T>> = new Set()

    private _state: T

    constructor(private initialState: T) {
        this._state = initialState
    }

    dispatch<E extends Event<string>>(event: E): void {
        const reducer = this._reducers[event.eventType]
        if (reducer) {
            const newState = reducer(this._state, event);
            this.setState(newState)
        }
    }

    case<E extends Event<string>>(eventType: string, reducer: Reducer<T>): this {
        this._reducers[eventType] = reducer
        return this
    }

    getState(): T {
        return this._state
    }

    setState(state: T): void {
        this._state = state
        this._subscripbers.forEach(subscripber => subscripber(state))
    }

    subscribe(subscripber: Subscriber<T>): void {
        this._subscripbers.add(subscripber)
    }

    unsubscribe(subscripber: Subscriber<T>): void {
        this._subscripbers.delete(subscripber)
    }
}
