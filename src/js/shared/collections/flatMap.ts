export default function* flatMap<TSource, TResult>(
    collectionSelector: (item: TSource) => Iterable<TResult>
): Iterable<TResult> {
    for (const value of this) {
        yield* collectionSelector(value)
    }
}
