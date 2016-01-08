export default function* filter<T>(predicate: (item: T) => boolean): Iterable<T> {
    for (const item of this) {
        if (predicate(item)) {
            yield item
        }
    }
}
