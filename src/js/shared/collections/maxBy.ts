export default function maxBy<TSource, TKey>(keySelector: (value: TSource) => TKey): TSource {
    let computed: TKey
    let result: TSource

    for (const value of this) {
        const key = keySelector(value)
        if (computed == null || key > computed) {
            computed = key
            result = value
        }
    }

    return result
}
