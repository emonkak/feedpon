import { Observable } from 'rxjs/Observable';

export interface IAction<T> {
    actionType: T;
}

export interface IEvent<T> {
    eventType: T;
}

export type AnyAction = IAction<string>;

export type AnyEvent = IEvent<string>;

export type EventDispatcher = (event: AnyEvent) => void;

export interface IActionDispatcher {
    dispatch(action: AnyAction): Observable<AnyEvent>;
}

export interface IActionHandler<T extends AnyAction> {
    handle(action: T, dispatch: EventDispatcher): Promise<void>;
}

export interface IActionHandlerClass<T extends AnyAction> {
    new(...args: any[]): IActionHandler<T>;
}

export type Reducer<TResult, TValue> = (result: TResult, value: TValue) => TResult;
