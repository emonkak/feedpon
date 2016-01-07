import { Reducer } from '../interfaces'

export default function combineReducersByKey<TResult, TValue>(reducers: { [key: string]: Reducer<TResult, TValue> }, keySelector: (value: TValue) => string): Reducer<TResult, TValue> {
    return (acc, value) => {
        const key = keySelector(value)
        const reducer = reducers[key]
        return reducer ? reducer(acc, value) : acc
    }
}
