import { IInjectable, IInjectableClass, IInjectableFunction, IInstantiable, IDependency, IScope } from './interfaces'

export class ClassDependency<T> implements IDependency<T>, IInstantiable<T> {
    constructor(private _target: IInjectableClass<T>,
                private _dependencies: IDependency<any>[],
                private _scope: IScope<T>) {
        if (typeof _target !== 'function') {
            throw `"${_target}" is not a class constructor.`
        }
    }

    get injectable(): IInjectable<T> {
        return this._target
    }

    get(): T {
        return this._scope(this)
    }

    instantiate(): T {
        const args = this._dependencies.map(dependency => dependency.get())
        return new this._target(...args)
    }
}

export class FactoryDependency<T> implements IDependency<T>, IInstantiable<T> {
    constructor(private _factory: IInjectableFunction<T>,
                private _dependencies: IDependency<any>[],
                private _scope: IScope<T>) {
        if (typeof _factory !== 'function') {
            throw `"${_factory}" is not a factory function.`
        }
    }

    get injectable(): IInjectable<T> {
        return this._factory
    }

    get(): T {
        return this._scope(this)
    }

    instantiate(): T {
        const args = this._dependencies.map(dependency => dependency.get())
        return this._factory(...args)
    }
}
