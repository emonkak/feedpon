import { Observable } from 'rxjs/Observable';

export interface GenericAction<T> {
    actionType: T;
}

export interface GenericEvent<T> {
    eventType: T;
}

export type AnyAction = GenericAction<string>;

export type AnyEvent = GenericEvent<string>;

export interface IEventDispatcher {
    (event: AnyEvent): void
}

export interface IActionDispatcher {
    dispatch(action: AnyAction): Observable<AnyEvent>;
}

export interface IActionHandler<T extends AnyAction> {
    handle(action: T, dispatch: IEventDispatcher): Promise<void>;
}

export interface IActionHandlerClass<T extends AnyAction> {
    new(...args: any[]): IActionHandler<T>;
}
