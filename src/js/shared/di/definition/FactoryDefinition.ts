import AbstractDefinition from './AbstractDefinition'
import FactoryDependency from '../dependency/FactoryDependency';
import { IDependency, IInjectableFunction, IInjectionPolicy, IResolver } from '../interfaces';

export default class FactoryDefinition<T> extends AbstractDefinition<T> {
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
