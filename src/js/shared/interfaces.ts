import { Observable } from 'rxjs/Observable'

export interface Action<T> {
    actionType: T
}

export interface Event<T> {
    eventType: T
}

export type AnyAction = Action<string>

export type AnyEvent = Event<string>

export type EventDispatcher = (event: AnyEvent) => void

export interface IActionDispatcher {
    dispatch<T extends AnyAction>(action: T): Observable<AnyEvent>
}

export interface IActionHandler<T extends AnyAction> {
    handle(action: T, dispatch: EventDispatcher): Promise<void>
}

export interface IActionHandlerClass<T extends AnyAction> {
    new(...args: any[]): IActionHandler<T>
}

export type Reducer<TResult, TValue> = (result: TResult, value: TValue) => TResult
