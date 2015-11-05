/// <reference path="../../../node_modules/reflect-metadata/reflect-metadata.d.ts" />
import 'reflect-metadata';
import { singletonScope, prototypeScope } from './scopes';
function merge(xs, ys) {
    const zs = [].concat(xs);
    ys.forEach((y, i) => {
        zs[i] = y;
    });
    return zs;
}
export function Inject(target, key, desc) {
    if (typeof key !== 'undefined') {
        target[key].$inject = merge(Reflect.getMetadata('design:paramtypes', target, key), target[key].$inject || []);
        return target[key];
    }
    else {
        target.$inject = merge(Reflect.getMetadata('design:paramtypes', target), target.$inject || []);
        return target;
    }
}
export function Singleton(target) {
    target.$scope = singletonScope;
    return target;
}
export function Prototype(target) {
    target.$scope = prototypeScope;
    return target;
}
export function Named(key) {
    return (target, propertyKey, parameterIndex) => {
        target.$inject = target.$inject || new Array(target.length);
        target.$inject[parameterIndex] = key;
        return target;
    };
}
