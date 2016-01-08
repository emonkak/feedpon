export default function* groupJoin<TOuter, TInner, TKey, TResult>(
    inner: Iterable<TInner>,
    outerKeySelector: (item: TOuter) => TKey,
    innerKeySelector: (item: TInner) => TKey,
    resultSelector: (outer: TOuter, inner: TInner[]) => TResult
): Iterable<TResult> {
    const table = prepareLookupTable(inner, innerKeySelector)

    for (const item of this) {
        const key = outerKeySelector(item)
        if (table.has(key)) {
            yield resultSelector(item, table.get(key))
        } else {
            yield resultSelector(item, [])
        }
    }
}

function prepareLookupTable<TInner, TKey>(inner: Iterable<TInner>, innerKeySelector: (item: TInner) => TKey): Map<TKey, TInner[]> {
    const table = new Map<TKey, TInner[]>()

    for (const item of inner) {
        const key = innerKeySelector(item)
        if (table.has(key)) {
            table.get(key).push(item)
        } else {
            table.set(key, [item])
        }
    }

    return table
}
