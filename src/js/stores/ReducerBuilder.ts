import combineReducersByType from './combineReducersByType'
import { Event } from '../eventDispatchers/interfaces'
import { Reducer } from './interfaces'

export default class ReducerBuilder<T> {
    private _reducers: { [key: string]: Reducer<T, Event<string>> } = {}

    on<U extends Event<string>>(eventType: string, reducer: Reducer<T, U>): this {
        this._reducers[eventType] = reducer
        return this
    }

    build(): Reducer<T, Event<string>> {
        return combineReducersByType(this._reducers)
    }
}
