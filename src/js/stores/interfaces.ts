import { IEventDispatcher, ISubscribable } from '../eventDispatchers/interfaces'

export type Reducer<T, U> = (acc: T, value: U) => T

export interface IStore<T> extends IEventDispatcher, ISubscribable<T> {
    getState(): T

    setState(state: T): void
}
