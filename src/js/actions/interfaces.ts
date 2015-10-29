export interface Action<T> {
    type: T
}

export interface IActionHandler<A extends Action<any>, R> {
    handle(action: A): Promise<R>
}

export interface IActionHandlerClass<A extends Action<any>, R> {
    new(...args: any[]): IActionHandler<A, R>
}

export interface IActionDispatcher {
    dispatch<A extends Action<string>>(action: A): Promise<Object>
}

export interface AuthAction extends Action<string> {
}

export interface CountAction extends Action<string> {
    delta: number
}
