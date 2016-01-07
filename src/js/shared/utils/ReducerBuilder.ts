import combineReducersByKey from './combineReducersByKey'
import { Reducer } from '../interfaces'

export default class ReducerBuilder<TResult, TValue> {
    private _reducers: { [key: string]: Reducer<TResult, TValue> } = {}

    constructor(private _keySelector: (value: TValue) => string) {
    }

    on<T extends TValue>(key: string, reducer: Reducer<TResult, T>): this {
        this._reducers[key] = reducer
        return this
    }

    build(): Reducer<TResult, TValue> {
        return combineReducersByKey(this._reducers, this._keySelector)
    }
}
