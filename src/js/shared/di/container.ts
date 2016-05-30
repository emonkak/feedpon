import AliasDefinition from './definition/AliasDefinition';
import BindDefinition from './definition/BindDefinition';
import FactoryDefinition from './definition/FactoryDefinition';
import ValueDefinition from './definition/ValueDefinition';
import { IContainer, IDefinition, IDependency, IResolver, IInjectable, IInjectableClass, IInjectableKey, IInjectableFunction, IInjectionPolicy } from './interfaces';

export default class Container implements IContainer {
    private _definitions: Map<IInjectableKey<any>, IDefinition<any>> = new Map();

    private _instances: WeakMap<IInjectable<any>, any> = new WeakMap();

    constructor(private _injectionPolicy: IInjectionPolicy) {
    }

    alias<T>(key: IInjectableKey<T>, target: IInjectableKey<T>): AliasDefinition<T> {
        const definition = new AliasDefinition<T>(target);

        this._definitions.set(key, definition);

        return definition;
    }

    bind<T>(key: IInjectableClass<T>): BindDefinition<T> {
        const definition = new BindDefinition<T>(key);

        this._definitions.set(key, definition);

        return definition;
    }

    factory<T>(key: IInjectableKey<T>, factory: IInjectableFunction<T>): FactoryDefinition<T> {
        const definition = new FactoryDefinition<T>(factory);

        this._definitions.set(key, definition);

        return definition;
    }

    set<T>(key: IInjectableKey<T>, value: T): ValueDefinition<T> {
        const definition = new ValueDefinition<T>(value);

        this._definitions.set(key, definition);

        return definition;
    }

    resolve<T>(key: IInjectableKey<T>): IDependency<T> {
        let definition: IDefinition<T>;

        if (this._definitions.has(key)) {
            definition = this._definitions.get(key);
        } else if (typeof key === 'function') {
            definition = new BindDefinition(key);
        } else {
            throw `Can't resolve the dependencies for "${key}"`;
        }

        return definition.resolveBy(this, this._injectionPolicy);
    }

    get<T>(key: IInjectableKey<T>): T {
        return this.resolve(key).get(this._instances);
    }

    has<T>(key: IInjectableKey<T>): boolean {
        return this._definitions.has(key) || (typeof key === 'function' && this._injectionPolicy.isInjectable(key));
    }

    inject<T>(fn: IInjectableFunction<T>, context: any = null): T {
        const injectables = this._injectionPolicy.getInjectables(fn);
        const args = injectables.map(injectable => this.get(injectable));
        return fn.apply(context, args);
    }
}
