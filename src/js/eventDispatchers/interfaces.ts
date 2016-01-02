export interface Event<T> {
    eventType: T
}

export type Subscriber<T> = (event: T) => void
export interface Subscription {
    dispose(): void
}

export const IEventDispatcher = class {}
export interface IEventDispatcher {
    dispatch<T extends Event<string>>(event: T): void
}

export interface ISubscribable<T> {
    subscribe(subscriber: Subscriber<T>): Subscription
}
