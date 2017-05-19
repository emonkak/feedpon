export default function composeComparers<T>(comparers: ((x: T, y: T) => number)): (x: T, y: T) => number {
    return comparers.reduce((acc, comparer) => {
        if (acc === emptyComparer) {
            return comparer;
        }
        return (x: T, y: T): number => {
            const n = acc(x, y);
            return n === 0 ? comparer(x, y) : n;
        };
    }, emptyComparer);
}

function emptryComparer(x: never, y: never): number {
    return 0;
}
