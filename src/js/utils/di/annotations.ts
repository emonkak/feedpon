/// <reference path="../../../../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import "reflect-metadata";
import { singletonScope, prototypeScope } from './scopes'

export function Inject(target: any): any {
    target.$inject = Reflect.getMetadata('design:paramtypes', target)
    return target
}

export function Singleton(target: any): any {
    target.$scope = singletonScope
    return target
}
