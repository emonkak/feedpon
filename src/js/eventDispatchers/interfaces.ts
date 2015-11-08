export interface Event<T> {
    eventType: T
}

export const IEventDispatcher = class {}
export interface IEventDispatcher {
    dispatch<T extends Event<string>>(event: T): void
}
