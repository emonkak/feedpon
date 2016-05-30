import AbstractDefinition from './AbstractDefinition'
import ClassDependency from '../dependency/ClassDependency';
import { IDependency, IInjectableClass, IInjectionPolicy, IResolver } from '../interfaces';

export default class BindDefinition<T> extends AbstractDefinition<T> {
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

