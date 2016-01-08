export default function* flatMap<T, TCollection>(
    collectionSelector: (item: T) => Iterable<TCollection>
): Iterable<TCollection> {
    for (const item of this) {
        yield* collectionSelector(item)
    }
}
