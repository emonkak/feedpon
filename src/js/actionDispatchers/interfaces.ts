export interface Action<T> {
    actionType: T
}

export interface IActionHandler<T extends Action<any>, U> {
    handle(action: T): Promise<U>
}

export interface IActionHandlerClass<T extends Action<any>, U> {
    new(...args: any[]): IActionHandler<T, U>
}

export interface IActionDispatcher {
    dispatch<T extends Action<string>>(action: T): Promise<any>
}
