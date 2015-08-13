import { IContainer, IDefinition, IDependency, IResolver, IInjectableClass, IInjectableFunction, IInjectionPolicy } from './interfaces'
import { AliasDefinition, ClassDefinition, ValueDefinition, ProviderDefinition } from './definitions'

export default class Container implements IContainer, IResolver {
    private _definitions: Map<IInjectableClass<any>, IDefinition<any>> = new Map<IInjectableClass<any>, IDefinition<any>>()

    constructor(private _injectionPolicy: IInjectionPolicy) {
    }

    alias<T>(key: IInjectableClass<T>, target: IInjectableClass<T>): AliasDefinition<T> {
        const definition = new AliasDefinition<T>(target)

        this._definitions.set(key, definition)

        return definition
    }

    bind<T>(key: IInjectableClass<T>): ClassDefinition<T> {
        const definition = new ClassDefinition<T>(key)

        this._definitions.set(key, definition)

        return definition
    }

    provider<T>(key: IInjectableClass<T>, provider: IInjectableFunction<T>): ProviderDefinition<T> {
        const definition = new ProviderDefinition<T>(provider)

        this._definitions.set(key, definition)

        return definition
    }

    set<T>(key: IInjectableClass<T>, value: T): ValueDefinition<T> {
        const definition = new ValueDefinition<T>(value)

        this._definitions.set(key, definition)

        return definition
    }

    resolve<T>(key: IInjectableClass<T>): IDependency<T> {
        if (key == null) throw "Can't resolve the dependencies for null"

        const definition = this._definitions.has(key)
            ? this._definitions.get(key)
            : new ClassDefinition(key)

        return definition.resolveBy(this, this._injectionPolicy)
    }

    get<T>(key: IInjectableClass<T>): T {
        return this.resolve(key).get()
    }

    has<T>(key: IInjectableClass<T>): boolean {
        return this._definitions.has(key) || this._injectionPolicy.isInjectable(key)
    }

    inject<T>(fn: IInjectableFunction<T>, context: any = null): T {
        const injectables = this._injectionPolicy.getInjectables(fn)
        const args = injectables.map(injectable => this.get(injectable))
        return fn.apply(context, args)
    }
}
