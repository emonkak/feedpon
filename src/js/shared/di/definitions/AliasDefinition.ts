import { IDefinition, IDependency, IInjectableKey, IInjectionPolicy, IResolver } from '../interfaces';

export default class AliasDefinition<T> implements IDefinition<T> {
    constructor(private _target: IInjectableKey<T>) {
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        return resolver.resolve(this._target);
    }
}

