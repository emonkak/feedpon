declare module 'fbjs/lib/shallowEqual' {
    function shallowEqual(x: any, y: any): boolean;

    export = shallowEqual;
}

declare module 'fbjs/lib/mapObject' {
    function mapObject<TValue, TContext>(
        object: { [name: string]: TValue },
        callback: (this: TContext, value: TValue, name: string, object: { [name: string]: TValue }) => TValue,
        context?: TContext
    ): { [key: string]: TValue };
    function mapObject<TValue, TContext>(
        object: { [name: string]: TValue } | null,
        callback: (this: TContext, value: TValue, name: string, object: { [name: string]: TValue }) => TValue,
        context?: TContext
    ): { [key: string]: TValue } | null;

    export = mapObject;
}
