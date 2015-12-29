/// <reference path="../../../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import 'reflect-metadata'
import { IInjectableKey } from './interfaces'
import { singletonScope, prototypeScope } from './scopes'

function merge<T>(xs: T[], ys: T[]): T[] {
    const zs = [].concat(xs)
    ys.forEach((y, i) => {
        zs[i] = y
    })
    return zs
}

export function Inject(target: any, key?: any, desc?: any): any {
    if (typeof key !== 'undefined') {
        target[key].$inject = merge(
            Reflect.getMetadata('design:paramtypes', target, key),
            target[key].$inject || []
        )
        return target[key]
    } else {
        target.$inject = merge(
            Reflect.getMetadata('design:paramtypes', target),
            target.$inject || []
        )
        return target
    }
}

export function Singleton(target: any): any {
    target.$scope = singletonScope
    return target
}

export function Prototype(target: any): any {
    target.$scope = prototypeScope
    return target
}

export function Named<T>(key: IInjectableKey<T>): any {
    return (target: any, propertyKey: string | symbol, parameterIndex: number): any => {
        target.$inject = target.$inject || new Array(target.length)
        target.$inject[parameterIndex] = key
        return target
    }
}
