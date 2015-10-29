import { IInjectable, IInjectableKey, IInjectionPolicy, IScope } from './interfaces'
import { prototypeScope } from './scopes'

export class DefaultInjectionPolicy implements IInjectionPolicy {
    getInjectables<T>(target: IInjectable<T>): IInjectableKey<any>[] {
        return target.$inject
    }

    getScope<T>(target: IInjectable<T>): IScope<T> {
        return target.$scope || prototypeScope
    }

    isInjectable<T>(target: IInjectable<T>): boolean {
        return target.$inject && target.$inject.length === target.length
    }
}
