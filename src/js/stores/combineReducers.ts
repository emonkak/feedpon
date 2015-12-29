import { Event } from '../eventDispatchers/interfaces'
import { Reducer } from './interfaces'

export default function combineReducers<T>(...reducers: Reducer<T, Event<string>>[]): Reducer<T, Event<string>> {
    return (state: T, event: Event<string>): T => {
        return reducers.reduce((state, reducer) => reducer(state, event), state)
    }
}
