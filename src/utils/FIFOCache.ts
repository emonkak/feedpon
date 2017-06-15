export interface FIFOCache<T> {
    capacity: number;
    keys: string[];
    indices: { [key: string]: T };
}

export function empty<T>(capacity: number): FIFOCache<T> {
    if (capacity < 1) {
        throw new Error('The cache capacity must be at least 1.');
    }
    return {
        capacity,
        keys: [],
        indices: {}
    };
}

export function create<T>(entries: [string, T][], capacity: number): FIFOCache<T> {
    return entries.reduce((acc, [key, value]) => {
        acc.keys.push(key);
        acc.indices[key] = value;
        return acc;
    }, empty<T>(capacity));
}

export function extend<T>(container: FIFOCache<T>, capacity: number): FIFOCache<T> {
    if (capacity < 1) {
        throw new Error('The cache capacity must be at least 1.');
    }
    return unsafeRemoveOverflowEntries({
        capacity,
        keys: [...container.keys],
        indices: Object.assign({}, container.indices)
    });
}

export function get<T>(container: FIFOCache<T>, key: string): T | undefined;
export function get<T, TDefault>(container: FIFOCache<T>, key: string, defaultValue: TDefault): T | TDefault;
export function get<T, TDefault>(container: FIFOCache<T>, key: string, defaultValue?: TDefault): T | TDefault | undefined {
    return has(container, key) ? container.indices[key]! : defaultValue;
}

export function set<T>(container: FIFOCache<T>, key: string, value: T): FIFOCache<T> {
    let keys = container.keys;

    if (has(container, key)) {
        keys = keys.filter((k) => k !== key);
        keys.push(key);
    } else {
        keys = [...keys, key];
    }

    const indices = {
        ...container.indices,
        [key]: value
    };

    return unsafeRemoveOverflowEntries({
        capacity: container.capacity,
        keys,
        indices
    });
}

export function has<T>(container: FIFOCache<T>, key: string): boolean {
    return container.indices.hasOwnProperty(key);
}

export function remove<T>(container: FIFOCache<T>, key: string): FIFOCache<T> {
    if (!has(container, key)) {
        return container;
    }

    const keys = container.keys.filter(k => k !== key);
    const indices = Object.assign({}, container.indices);

    delete indices[key];

    return {
        capacity: container.capacity,
        keys,
        indices
    };
}

export function size<T>(container: FIFOCache<T>): number {
    return container.keys.length;
}

export function keys<T>(container: FIFOCache<T>): string[] {
    return container.keys;
}

export function values<T>(container: FIFOCache<T>): T[] {
    return container.keys.map((key) => container.indices[key]!);
}

export function map<T, TResult>(container: FIFOCache<T>, keySelector: (value: T, key: string, index: number) => string, valueSelector: (value: T, key: string, index: number) => TResult) {
    return container.keys.reduce((acc, k, i) => {
        const v = container.indices[k]!;
        const key = keySelector(v, k, i);
        const value = valueSelector(v, k, i);
        acc.keys.push(key);
        acc.indices[key] = value;
        return acc;
    }, empty<TResult>(container.capacity));
}

export function mapValues<T, TResult>(container: FIFOCache<T>, selector: (value: T, key: string, index: number) => TResult): FIFOCache<TResult> {
    return container.keys.reduce((acc, k, i) => {
        const v = container.indices[k]!;
        acc.keys.push(k);
        acc.indices[k] = selector(v, k, i);
        return acc;
    }, empty<TResult>(container.capacity));
}

export function filter<T>(container: FIFOCache<T>, predicate: (element: T, key: string, index: number) => boolean): FIFOCache<T> {
    return container.keys.reduce((acc, k, i) => {
        const value = container.indices[k]!;
        if (predicate(value, k, i)) {
            acc.keys.push(k);
            acc.indices[k] = value;
        }
        return acc;
    }, empty<T>(container.capacity));
}

function unsafeRemoveOverflowEntries<T>(container: FIFOCache<T>): FIFOCache<T> {
    const { capacity, indices, keys } = container;

    for (let i = capacity - keys.length; i < 0; i++) {
        const key = keys.shift()!;
        delete indices[key];
    }

    return container;
}
