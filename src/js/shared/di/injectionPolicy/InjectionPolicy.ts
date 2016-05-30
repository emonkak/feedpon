import { IInjectable, IInjectableKey, IInjectionPolicy, IScope } from '../interfaces';

export default class InjectionPolicy implements IInjectionPolicy {
    constructor(private _defaultScope: IScope<any>) {
    }

    getInjectables<T>(target: IInjectable<T>): IInjectableKey<any>[] {
        return target.$inject;
    }

    getScope<T>(target: IInjectable<T>): IScope<T> {
        return target.$scope || this._defaultScope;
    }

    isInjectable<T>(target: IInjectable<T>): boolean {
        return target.$inject && target.$inject.length === target.length;
    }
}

