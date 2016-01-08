export default function* concatWith<T>(...sources: Iterable<T>[]): Iterable<T> {
    yield* this
    for (const source of sources) {
        yield* source
    }
}

