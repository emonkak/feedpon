export interface CacheMap<T> {
    capacity: number;
    keys: string[];
    indices: { [key: string]: T };
}

export function empty<T>(capacity: number): CacheMap<T> {
    if (capacity < 1) {
        throw new Error('The cache capacity must be at least 1.');
    }
    return {
        capacity,
        keys: [],
        indices: {}
    };
}

export function create<T>(entries: [string, T][], capacity: number): CacheMap<T> {
    return entries.reduce((acc, [key, value]) => {
        acc.keys.push(key);
        acc.indices[key] = value;
        return acc;
    }, empty<T>(capacity));
}

export function extend<T>(c: CacheMap<T>, capacity: number): CacheMap<T> {
    if (capacity < 1) {
        throw new Error('The cache capacity must be at least 1.');
    }
    return unsafeRemoveOverflowEntries({
        capacity,
        keys: [...c.keys],
        indices: Object.assign({}, c.indices)
    });
}

export function get<T>(c: CacheMap<T>, key: string): T | undefined;
export function get<T, TDefault>(c: CacheMap<T>, key: string, defaultValue: TDefault): T | TDefault;
export function get<T, TDefault>(c: CacheMap<T>, key: string, defaultValue?: TDefault): T | TDefault | undefined {
    return has(c, key) ? c.indices[key]! : defaultValue;
}

export function set<T>(c: CacheMap<T>, key: string, value: T): CacheMap<T> {
    const keys = has(c, key)
        ? [...c.keys.filter((k) => k !== key), key]
        : [...c.keys, key];

    const indices = {
        ...c.indices,
        [key]: value
    };

    return unsafeRemoveOverflowEntries({
        capacity: c.capacity,
        keys,
        indices
    });
}

export function has<T>(c: CacheMap<T>, key: string): boolean {
    return c.indices.hasOwnProperty(key);
}

export function remove<T>(c: CacheMap<T>, key: string): CacheMap<T> {
    if (!has(c, key)) {
        return c;
    }

    const keys = c.keys.filter((k) => k !== key);
    const indices = Object.assign({}, c.indices);

    delete indices[key];

    return {
        capacity: c.capacity,
        keys,
        indices
    };
}

export function size<T>(c: CacheMap<T>): number {
    return c.keys.length;
}

export function keys<T>(c: CacheMap<T>): string[] {
    return c.keys;
}

export function values<T>(c: CacheMap<T>): T[] {
    return c.keys.map((key) => c.indices[key]!);
}

export function toObject<T>(c: CacheMap<T>): { [key: string]: T } {
    return c.indices;
}

export function map<T, TResult>(c: CacheMap<T>, keySelector: (value: T, key: string, index: number) => string, valueSelector: (value: T, key: string, index: number) => TResult) {
    return c.keys.reduce((acc, k, i) => {
        const v = c.indices[k]!;
        const key = keySelector(v, k, i);
        const value = valueSelector(v, k, i);
        acc.keys.push(key);
        acc.indices[key] = value;
        return acc;
    }, empty<TResult>(c.capacity));
}

export function mapValues<T, TResult>(c: CacheMap<T>, selector: (value: T, key: string, index: number) => TResult): CacheMap<TResult> {
    return c.keys.reduce((acc, k, i) => {
        const v = c.indices[k]!;
        acc.keys.push(k);
        acc.indices[k] = selector(v, k, i);
        return acc;
    }, empty<TResult>(c.capacity));
}

export function filter<T>(c: CacheMap<T>, predicate: (element: T, key: string, index: number) => boolean): CacheMap<T> {
    return c.keys.reduce((acc, k, i) => {
        const value = c.indices[k]!;
        if (predicate(value, k, i)) {
            acc.keys.push(k);
            acc.indices[k] = value;
        }
        return acc;
    }, empty<T>(c.capacity));
}

function unsafeRemoveOverflowEntries<T>(c: CacheMap<T>): CacheMap<T> {
    const { capacity, indices, keys } = c;

    for (let i = capacity - keys.length; i < 0; i++) {
        const key = keys.shift()!;
        delete indices[key];
    }

    return c;
}
