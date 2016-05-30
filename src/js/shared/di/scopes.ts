import { IInjectable, IInstantiable } from './interfaces';

export function prototypeScope<T>(instantiable: IInstantiable<T>, instances: WeakMap<IInjectable<any>, any>): T {
    return instantiable.instantiate(instances);
}

export function singletonScope<T>(instantiable: IInstantiable<T>, instances: WeakMap<IInjectable<any>, any>): T {
    const injectable = instantiable.getInjectable();

    if (instances.has(injectable)) {
        return instances.get(injectable);
    }

    const instance = instantiable.instantiate(instances);

    instances.set(injectable, instance);

    return instance;
}
