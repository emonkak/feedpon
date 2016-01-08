export default function toArray<T>(): T[] {
    return Array.isArray(this) ? this : Array.from(this)
}
