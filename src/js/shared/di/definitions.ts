import { IDefinition, IDependency, IInjectable, IInjectableClass, IInjectableKey, IInjectableFunction, IInjectionPolicy, IResolver, IScope } from './interfaces';
import { ClassDependency, FactoryDependency } from './dependencies';

abstract class BaseDefinition<T> implements IDefinition<T> {
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

export class AliasDefinition<T> implements IDefinition<T> {
    constructor(private _target: IInjectableKey<T>) {
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        return resolver.resolve(this._target);
    }
}

export class ClassDefinition<T> extends BaseDefinition<T> {
    constructor(private _target: IInjectableClass<T>) {
        super();
    }

    to(target: IInjectableClass<T>) {
        this._target = target;
        return this;
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        if (!(this._injectables || injectionPolicy.isInjectable(this._target))) {
            throw `"${this._target}" is not injectable.`;
        }

        try {
            const injectables = this._injectables || injectionPolicy.getInjectables(this._target);
            const dependencies = injectables.map(injectable => resolver.resolve(injectable));
            const scope = this._scope || injectionPolicy.getScope(this._target);
            return new ClassDependency<T>(this._target, dependencies, scope);
        } catch (e) {
            throw (e + ' Caused by ' + this._target);
        }
    }
}

export class FactoryDefinition<T> extends BaseDefinition<T> {
    constructor(private _factory: IInjectableFunction<T>) {
        super();
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        if (!(this._injectables || injectionPolicy.isInjectable(this._factory))) {
            throw `"${this._factory}" is not injectable.`;
        }

        try {
            const injectables = this._injectables || injectionPolicy.getInjectables(this._factory);
            const dependencies = injectables.map(injectable => resolver.resolve(injectable));
            const scope = this._scope || injectionPolicy.getScope(this._factory);
            return new FactoryDependency<T>(this._factory, dependencies, scope);
        } catch (e) {
            throw (e + ' Caused by ' + this._factory);
        }
    }
}

export class ValueDefinition<T> implements IDefinition<T>, IDependency<T> {
    constructor(private _value: T) {
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        return this;
    }

    get(instances: WeakMap<IInjectable<any>, any>): T {
        return this._value;
    }
}
