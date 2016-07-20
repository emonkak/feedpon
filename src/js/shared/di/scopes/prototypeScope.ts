import { IInjectable, IInstantiable } from '../interfaces';

export default function prototypeScope<T>(instantiable: IInstantiable<T>, instances: WeakMap<IInjectable<any>, any>): T {
    return instantiable.instantiate(instances);
}

