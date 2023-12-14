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

export function extend<T>(map: CacheMap<T>, capacity: number): CacheMap<T> {
    if (capacity < 1) {
        throw new Error('The cache capacity must be at least 1.');
    }
    return deleteOverflowEntries({
        capacity,
        keys: [...map.keys],
        indices: Object.assign({}, map.indices)
    });
}

export function get<T>(map: CacheMap<T>, key: string): T | undefined;
export function get<T, TDefault>(map: CacheMap<T>, key: string, defaultValue: TDefault): T | TDefault;
export function get<T, TDefault>(map: CacheMap<T>, key: string, defaultValue?: TDefault): T | TDefault | undefined {
    return has(map, key) ? map.indices[key]! : defaultValue;
}

export function set<T>(map: CacheMap<T>, key: string, value: T): CacheMap<T> {
    const keys = has(map, key)
        ? [...map.keys.filter((k) => k !== key), key]
        : [...map.keys, key];

    const indices = {
        ...map.indices,
        [key]: value
    };

    return deleteOverflowEntries({
        capacity: map.capacity,
        keys,
        indices
    });
}

export function update<T>(map: CacheMap<T>, key: string, updater: (value: T) => T): CacheMap<T> {
    if (!has(map, key)) {
        return map;
    }

    const keys = [...map.keys.filter((k) => k !== key), key];

    const value = map.indices[key]!;
    const indices = {
        ...map.indices,
        [key]: updater(value),
    };

    return deleteOverflowEntries({
        capacity: map.capacity,
        keys,
        indices
    });
}

export function has<T>(map: CacheMap<T>, key: string): boolean {
    return map.indices.hasOwnProperty(key);
}

export function remove<T>(map: CacheMap<T>, key: string): CacheMap<T> {
    if (!has(map, key)) {
        return map;
    }

    const keys = map.keys.filter((k) => k !== key);
    const indices = Object.assign({}, map.indices);

    delete indices[key];

    return {
        capacity: map.capacity,
        keys,
        indices
    };
}

export function size<T>(map: CacheMap<T>): number {
    return map.keys.length;
}

export function keys<T>(map: CacheMap<T>): string[] {
    return map.keys;
}

export function values<T>(map: CacheMap<T>): T[] {
    return map.keys.map((key) => map.indices[key]!);
}

export function toObject<T>(map: CacheMap<T>): { [key: string]: T } {
    return map.indices;
}

export function map<T, TResult>(map: CacheMap<T>, keySelector: (value: T, key: string, index: number) => string, valueSelector: (value: T, key: string, index: number) => TResult) {
    return map.keys.reduce((acc, k, i) => {
        const v = map.indices[k]!;
        const key = keySelector(v, k, i);
        const value = valueSelector(v, k, i);
        acc.keys.push(key);
        acc.indices[key] = value;
        return acc;
    }, empty<TResult>(map.capacity));
}

export function mapValues<T, TResult>(map: CacheMap<T>, selector: (value: T, key: string, index: number) => TResult): CacheMap<TResult> {
    return map.keys.reduce((acc, k, i) => {
        const v = map.indices[k]!;
        acc.keys.push(k);
        acc.indices[k] = selector(v, k, i);
        return acc;
    }, empty<TResult>(map.capacity));
}

export function filter<T>(map: CacheMap<T>, predicate: (element: T, key: string, index: number) => boolean): CacheMap<T> {
    return map.keys.reduce((acc, k, i) => {
        const value = map.indices[k]!;
        if (predicate(value, k, i)) {
            acc.keys.push(k);
            acc.indices[k] = value;
        }
        return acc;
    }, empty<T>(map.capacity));
}

function deleteOverflowEntries<T>(map: CacheMap<T>): CacheMap<T> {
    const { capacity, indices, keys } = map;

    for (let i = capacity - keys.length; i < 0; i++) {
        const key = keys.shift()!;
        delete indices[key];
    }

    return map;
}
