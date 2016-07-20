import { IDependency, IInjectable, IInjectableClass, IInstantiable, IScope } from '../interfaces';

export default class ClassDependency<T> implements IDependency<T>, IInstantiable<T> {
    constructor(private _target: IInjectableClass<T>,
                private _dependencies: IDependency<any>[],
                private _scope: IScope<T>) {
        if (typeof _target !== 'function') {
            throw `"${_target}" is not a class constructor.`;
        }
    }

    getInjectable(): IInjectable<T> {
        return this._target;
    }

    get(instances: WeakMap<IInjectable<any>, any>): T {
        return this._scope(this, instances);
    }

    instantiate(instances: WeakMap<IInjectable<any>, any>): T {
        const args = this._dependencies.map(dependency => dependency.get(instances));
        return new this._target(...args);
    }
}
