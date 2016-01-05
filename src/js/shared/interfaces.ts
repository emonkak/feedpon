export interface Event<T> {
    eventType: T
}

export type Subscriber<T> = (value: T) => void

export interface Subscription {
    dispose(): void
}

export interface ISubscribable<T> {
    subscribe(subscriber: Subscriber<T>): Subscription
}

export interface IEventDispatcher extends ISubscribable<Event<string>> {
    dispatch<T extends Event<string>>(event: T): void
}

export type Reducer<T, U> = (acc: T, value: U) => T

export interface IStore<T> extends ISubscribable<T> {
    dispatch<T extends Event<string>>(event: T): void

    getState(): T
}

export interface Action<T> {
    actionType: T
}

export interface IActionDispatcher {
    dispatch<T extends Action<string>>(action: T): Promise<any>
}

export interface IActionHandler<T extends Action<any>, U> {
    handle(action: T, eventDispatcher: IEventDispatcher): Promise<U>
}

export interface IActionHandlerClass<T extends Action<any>, U> {
    new(...args: any[]): IActionHandler<T, U>
}
