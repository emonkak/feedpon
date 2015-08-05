import { IInjectable, IInstantiable } from './interfaces'

const singletons = new WeakMap<IInjectable<any>, any>()

export function prototypeScope<T>(instantiable: IInstantiable<T>): T {
    return instantiable.instantiate()
}

export function singletonScope<T>(instantiable: IInstantiable<T>): T {
    const injectable = instantiable.injectable

    if (!singletons.has(injectable)) {
        singletons.set(injectable, instantiable.instantiate())
    }

    return singletons.get(injectable)
}
