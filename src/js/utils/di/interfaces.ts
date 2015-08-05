export interface IContainer {
    /**
     * Gets the instance from a given class.
     */
    get<T>(key: IInjectableClass<T>): T

    /**
     * Gets a value indicating whether can get the instance from a given class.
     */
    has<T>(key: IInjectableClass<T>): boolean
}

export interface IDefinition<T> {
    resolveBy(resolver: IResolver, injectionPolicy: IInjectionPolicy): IDependency<T>
}

export interface IDependency<T> {
    get(): T;
}

export interface IInjectable<T> extends Function {
    $inject?: IInjectableClass<T>[]
    $scope?: IScope<T>
}

export interface IInjectableClass<T> extends IInjectable<T> {
    new(...args: any[]): T
}

export interface IInjectableProvider<T> extends IInjectable<T> {
    (...args: any[]): T
}

export interface IInjectionPolicy {
    getInjectables<T>(target: IInjectable<T>): IInjectableClass<any>[]

    getScope<T>(target: IInjectable<T>): IScope<T>

    isInjectable<T>(target: IInjectable<T>): boolean
}

export interface IInstantiable<T> {
    injectable: IInjectable<T>

    instantiate(): T
}

export interface IResolver {
    resolve<T>(target: IInjectableClass<T>): IDependency<T>
}

export interface IScope<T> {
    (instantiable: IInstantiable<T>): T
}
