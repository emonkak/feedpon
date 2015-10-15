/// <reference path="../../../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import "reflect-metadata"
import { singletonScope, prototypeScope } from './scopes'

export function Inject(target: any, key?: any, desc?: any): any {
    if (typeof key !== 'undefined') {
        target[key].$inject = Reflect.getMetadata('design:paramtypes', target, key)
        return target[key]
    } else {
        target.$inject = Reflect.getMetadata('design:paramtypes', target)
        return target
    }
}

export function Singleton(target: any): any {
    target.$scope = singletonScope
    return target
}
