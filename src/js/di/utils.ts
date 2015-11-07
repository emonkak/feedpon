export function merge<T>(xs: T[], ys: T[]): T[] {
    const zs = [].concat(xs)
    ys.forEach((y, i) => {
        zs[i] = y
    })
    return zs
}
