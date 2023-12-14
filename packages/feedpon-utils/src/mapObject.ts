export default function mapObject<TValue, TResult, TContext>(
    object: { [name: string]: TValue },
    callback: (this: TContext | undefined, value: TValue, name: string, object: { [name: string]: TValue }) => TResult,
    context?: TContext
): { [key: string]: TResult } {
    const result: { [key: string]: TResult } = {};

    for (const name in object) {
        if (object.hasOwnProperty(name)) {
            result[name] = callback.call(context, object[name]!, name, object);
        }
    }

    return result;
}
