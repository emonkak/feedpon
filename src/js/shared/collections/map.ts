export default function* filter<T, TResult>(selector: (value: T) => TResult): Iterable<TResult> {
    for (const value of this) {
        yield selector(value)
    }
}
