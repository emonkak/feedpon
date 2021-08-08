export default function shallowEqual<T extends Object>(first: T, second: T): boolean {
    if (first === second) {
        return true;
    }

    if (typeof first !== 'object' || first === null || typeof second !== 'object' || second === null) {
        return false;
    }

    const firstKeys = Object.keys(first) as [keyof T];
    const secondKeys = Object.keys(second) as [keyof T];

    if (firstKeys.length !== secondKeys.length) {
        return false;
    }

    for (let i = 0; i < firstKeys.length; i++) {
        if (!second.hasOwnProperty(firstKeys[i]) || first[firstKeys[i]] !== second[firstKeys[i]]) {
            return false;
        }
    }

    return true;
}
