import { IDefinition, IDependency, IInjectableClass, IInjectableFunction, IInjectionPolicy, IResolver, IScope } from './interfaces'
import { ClassDependency, ProviderDependency } from './dependencies'
import { prototypeScope } from './scopes'

class BaseDefinition<T> {
    protected _injectables: IInjectableClass<any>[]

    protected _scope: IScope<T>

    in(scope: IScope<T>): any {
        this._scope = scope
        return this
    }

    with(injectables: IInjectableClass<any>[]): any {
        this._injectables = injectables
        return this
    }
}

export class AliasDefinition<T> implements IDefinition<T> {
    constructor(private _target: IInjectableClass<T>) {
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        return resolver.resolve(this._target)
    }
}

export class ClassDefinition<T> extends BaseDefinition<T> implements IDefinition<T> {
    constructor(private _target: IInjectableClass<T>) {
        super()
    }

    to(target: IInjectableClass<T>) {
        this._target = target
        return this
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        if (!injectionPolicy.isInjectable(this._target)) {
            throw `"${this._target}" is not injectable.`
        }

        const injectables = this._injectables || injectionPolicy.getInjectables(this._target)
        const dependencies = injectables.map(injectable => resolver.resolve(injectable))
        const scope = this._scope || injectionPolicy.getScope(this._target)

        return new ClassDependency<T>(this._target, dependencies, scope)
    }
}

export class ProviderDefinition<T> extends BaseDefinition<T> implements IDefinition<T> {
    constructor(private _provider: IInjectableFunction<T>) {
        super()
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        if (!injectionPolicy.isInjectable(this._provider)) {
            throw `"${this._provider}" is not injectable.`
        }

        const injectables = this._injectables || injectionPolicy.getInjectables(this._provider)
        const dependencies = injectables.map(injectable => resolver.resolve(injectable))
        const scope = this._scope || injectionPolicy.getScope(this._provider)

        return new ProviderDependency<T>(this._provider, dependencies, scope)
    }
}

export class ValueDefinition<T> implements IDefinition<T>, IDependency<T> {
    constructor(private _value: T) {
    }

    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T> {
        return this
    }

    get(): T {
        return this._value
    }
}
