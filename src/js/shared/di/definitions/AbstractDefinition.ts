import { IDefinition, IDependency, IInjectableClass, IInjectionPolicy, IResolver, IScope } from '../interfaces';

abstract class AbstractDefinition<T> implements IDefinition<T> {
    protected _injectables: IInjectableClass<any>[];

    protected _scope: IScope<T>;

    in(scope: IScope<T>): this {
        this._scope = scope;
        return this;
    }

    with(injectables: IInjectableClass<any>[]): this {
        this._injectables = injectables;
        return this;
    }

    abstract resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T>;
}

export default AbstractDefinition;
