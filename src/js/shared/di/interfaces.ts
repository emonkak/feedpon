export interface IInjectable<T> extends Function {
    $inject?: IInjectableKey<any>[]
    $scope?: IScope<T>
}

export interface IInjectableClass<T> extends IInjectable<T> {
    new(...args: any[]): T
}

export interface IInjectableFunction<T> extends IInjectable<T> {
    (...args: any[]): T
}

export type IInjectableKey<T> = IInjectableClass<T> | string | symbol

export interface IContainer extends IResolver {
    /**
     * Gets the instance from a given class.
     */
    get<T>(key: IInjectableKey<T>): T

    /**
     * Gets a value indicating whether can get the instance from a given class.
     */
    has<T>(key: IInjectableKey<T>): boolean

    /**
     * Injects dependencies to a given function.
     */
    inject<T>(fn: IInjectableFunction<T>, context?: any): T
}

export interface IDefinition<T> {
    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T>
}

export interface IDependency<T> {
    get(): T
}

export interface IInjectionPolicy {
    getInjectables<T>(target: IInjectable<T>): IInjectableKey<any>[]

    getScope<T>(target: IInjectable<T>): IScope<T>

    isInjectable<T>(target: IInjectable<T>): boolean
}

export interface IInstantiable<T> {
    injectable: IInjectable<T>

    instantiate(): T
}

export interface IResolver {
    resolve<T>(target: IInjectableKey<T>): IDependency<T>
}

export interface IScope<T> {
    (instantiable: IInstantiable<T>): T
}
