export interface Action<T> {
    type: T
}

export interface IActionHandler<A extends Action<any>, R> {
    handle(action: A): Promise<R>
}

export interface IActionHandlerClass<A extends Action<any>, R> {
    new(...args: any[]): IActionHandler<A, R>
}

export interface IActionDispatcher<T> {
    dispatch<A extends Action<T>>(action: A): void
}

export interface AuthAction extends Action<string> {
}
