import { Event, IEventDispatcher, ISubscribable } from '../eventDispatchers/interfaces'

export type Reducer<T, U> = (acc: T, value: U) => T

export interface IStore<T> extends ISubscribable<T> {
    dispatch<T extends Event<string>>(event: T): void

    getState(): T
}
