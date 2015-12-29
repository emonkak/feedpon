import { Event } from '../eventDispatchers/interfaces'
import { Reducer } from './interfaces'

export default function combineReducersByType<T>(reducers: { [key: string]: Reducer<T, Event<string>> }): Reducer<T, Event<string>> {
    return (state: T, event: Event<string>): T => {
        const eventType = event.eventType
        const reducer = reducers[eventType]
        return reducer ? reducer(state, event) : state
    }
}
