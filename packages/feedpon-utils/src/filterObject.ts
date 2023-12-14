export default function filterObject<TValue, TContext>(
    object: { [name: string]: TValue },
    callback: (this: TContext | undefined, value: TValue, name: string, object: { [name: string]: TValue }) => boolean,
    context?: TContext
): { [key: string]: TValue } {
    const result: { [key: string]: TValue } = {};

    for (const name in object) {
        if (object.hasOwnProperty(name) && callback.call(context, object[name]!, name, object)) {
            result[name] = object[name]!;
        }
    }

    return result;
}
