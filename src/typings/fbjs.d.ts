declare module 'fbjs/lib/shallowEqual' {
    function shallowEqual(x: any, y: any): boolean;

    export = shallowEqual;
}

declare module 'fbjs/lib/mapObject' {
    function mapObject<TValue, TResult, TContext>(
        object: { [name: string]: TValue },
        callback: (this: TContext, value: TValue, name: string, object: { [name: string]: TValue }) => TResult,
        context?: TContext
    ): { [key: string]: TResult };
    function mapObject<TValue, TResult, TContext>(
        object: { [name: string]: TValue } | null,
        callback: (this: TContext, value: TValue, name: string, object: { [name: string]: TValue }) => TResult,
        context?: TContext
    ): { [key: string]: TResult } | null;

    export = mapObject;
}

declare module 'fbjs/lib/filterObject' {
    function filterObject<TValue, TContext>(
        object: { [name: string]: TValue },
        callback: (this: TContext, value: TValue, name: string, object: { [name: string]: TValue }) => boolean
    ): { [key: string]: TValue };
    function filterObject<TValue, TContext>(
        object: { [name: string]: TValue } | null,
        callback: (this: TContext, value: TValue, name: string, object: { [name: string]: TValue }) => boolean
    ): { [key: string]: TValue } | null;

    export = filterObject;
}
