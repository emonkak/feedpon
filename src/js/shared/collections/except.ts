export default function* except<T>(second: Iterable<T>): Iterable<T> {
    const set = new Set(second)

    for (const value of this) {
        if (!set.has(value)) {
            yield value
        }
    }
}

