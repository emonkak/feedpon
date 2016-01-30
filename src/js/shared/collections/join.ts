export default function* join<TOuter, TInner, TKey, TResult>(
    inner: Iterable<TInner>,
    outerKeySelector: (value: TOuter) => TKey,
    innerKeySelector: (value: TInner) => TKey,
    resultSelector: (outer: TOuter, inner: TInner) => TResult
): Iterable<TResult> {
    if ((this as any).length >= (inner as any).length) {
        const table = prepareLookupTable(inner, innerKeySelector)

        for (const value of this) {
            const key = outerKeySelector(value)
            if (table.has(key)) {
                yield resultSelector(value, table.get(key))
            }
        }
    } else {
        const table = prepareLookupTable(this, outerKeySelector)

        for (const value of inner) {
            const key = innerKeySelector(value)
            if (table.has(key)) {
                yield resultSelector(table.get(key), value)
            }
        }
    }
}

function prepareLookupTable<TInner, TKey>(inner: Iterable<TInner>, innerKeySelector: (value: TInner) => TKey): Map<TKey, TInner> {
    const table = new Map<TKey, TInner>()

    for (const value of inner) {
        const key = innerKeySelector(value)
        table.set(key, value)
    }

    return table
}
