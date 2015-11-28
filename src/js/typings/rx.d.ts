/// <reference path="../../DefinitelyTyped/rx/rx.all.d.ts" />

declare module Rx {
    interface ObservableStatic {
        fromEvent<T>(element: {addListener: (name: string, cb: (e: any) => any) => void; removeListener: (name: string, cb: (e: any) => any) => void}, eventName: string, selector?: (arguments: any[]) => T): Observable<T>;
    }
}
