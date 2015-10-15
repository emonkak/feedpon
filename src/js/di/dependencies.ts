import { IInjectableClass, IInjectableFunction, IInstantiable, IDependency, IScope } from './interfaces'

export class ClassDependency<T> implements IDependency<T>, IInstantiable<T> {
    constructor(private _target: IInjectableClass<T>,
                private _dependencies: IDependency<any>[],
                private _scope: IScope<T>) {
        if (typeof _target !== 'function') {
            throw `"${_target}" is not the class constructor.`
        }
    }

    get injectable() {
        return this._target
    }

    get(): T {
        return this._scope(this)
    }

    instantiate(): T {
        const args = this._dependencies.map((dependency) => dependency.get())
        return new this._target(...args)
    }
}

export class ProviderDependency<T> implements IDependency<T>, IInstantiable<T> {
    constructor(private _provider: IInjectableFunction<T>,
                private _dependencies: IDependency<any>[],
                private _scope: IScope<T>) {
        if (typeof _provider !== 'function') {
            throw `"${_provider}" is not the instance provider.`
        }
    }

    get injectable() {
        return this._provider
    }

    get(): T {
        return this._scope(this)
    }

    instantiate(): T {
        const args = this._dependencies.map((dependency) => dependency.get())
        return this._provider(...args)
    }
}
