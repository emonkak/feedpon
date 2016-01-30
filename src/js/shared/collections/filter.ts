export default function* filter<T>(predicate: (item: T) => boolean): Iterable<T> {
    for (const value of this) {
        if (predicate(value)) {
            yield value
        }
    }
}
