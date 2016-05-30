import { IDefinition, IDependency, IInjectable, IInjectionPolicy, IResolver } from '../interfaces';

export default class ValueDefinition<T> implements IDefinition<T>, IDependency<T> {
    constructor(private _value: T) {
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        return this;
    }

    get(instances: WeakMap<IInjectable<any>, any>): T {
        return this._value;
    }
}

