import 'reflect-metadata';

function merge<T>(xs: T[], ys: T[]): T[] {
    const zs = [].concat(xs);
    ys.forEach((y, i) => {
        zs[i] = y;
    });
    return zs;
}

export default function Inject(target: any, key?: any, desc?: any): any {
    if (typeof key !== 'undefined') {
        target[key].$inject = merge(
            Reflect.getMetadata('design:paramtypes', target, key),
            target[key].$inject || []
        );
        return target[key];
    } else {
        target.$inject = merge(
            Reflect.getMetadata('design:paramtypes', target),
            target.$inject || []
        );
        return target;
    }
}
