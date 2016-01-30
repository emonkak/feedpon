export default function* groupJoin<TOuter, TInner, TKey, TResult>(
    inner: Iterable<TInner>,
    outerKeySelector: (value: TOuter) => TKey,
    innerKeySelector: (value: TInner) => TKey,
    resultSelector: (outer: TOuter, inner: TInner[]) => TResult
): Iterable<TResult> {
    const table = prepareLookupTable(inner, innerKeySelector)

    for (const value of this) {
        const key = outerKeySelector(value)
        if (table.has(key)) {
            yield resultSelector(value, table.get(key))
        } else {
            yield resultSelector(value, [])
        }
    }
}

function prepareLookupTable<TInner, TKey>(inner: Iterable<TInner>, innerKeySelector: (value: TInner) => TKey): Map<TKey, TInner[]> {
    const table = new Map<TKey, TInner[]>()

    for (const value of inner) {
        const key = innerKeySelector(value)
        if (table.has(key)) {
            table.get(key).push(value)
        } else {
            table.set(key, [value])
        }
    }

    return table
}
