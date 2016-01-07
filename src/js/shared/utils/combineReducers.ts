import { Reducer } from '../interfaces'

export default function combineReducers<TResult, TValue>(...reducers: Reducer<TResult, TValue>[]): Reducer<TResult, TValue> {
    return (acc, value) => reducers.reduce((acc, reducer) => reducer(acc, value), acc)
}
