export default function composeComparers<T>(...comparers: ((x: T, y: T) => number)[]): (x: T, y: T) => number {
    return comparers.reduce((acc, next) => {
        if (acc === emptyComparer) {
            return next;
        }
        return (x: T, y: T): number => {
            const ordering = acc(x, y);
            return ordering !== 0 ? ordering : next(x, y);
        };
    }, emptyComparer);
}

function emptyComparer(x: any, y: any): number {
    return 0;
}
