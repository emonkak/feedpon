export default function* filter<T, TResult>(selector: (item: T) => TResult): Iterable<TResult> {
    for (const item of this) {
        yield selector(item)
    }
}
