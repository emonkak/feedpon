import { Observable } from 'rxjs/Observable';

export interface IAction<T extends string> {
    actionType: T;
}

export interface IEvent<T extends string> {
    eventType: T;
}

export type AnyAction = IAction<string>;

export type AnyEvent = IEvent<string>;

export interface IEventDispatcher {
    (event: AnyEvent): void;
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
