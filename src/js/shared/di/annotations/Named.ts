import { IInjectableKey } from '../interfaces';

export default function Named<T>(key: IInjectableKey<T>): any {
    return (target: any, propertyKey: string | symbol, parameterIndex: number): any => {
        target.$inject = target.$inject || new Array(target.length);
        target.$inject[parameterIndex] = key;
        return target;
    };
}
