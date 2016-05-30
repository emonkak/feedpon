import singletonScope from '../scope/singletonScope';

export default function Singleton(target: any): any {
    target.$scope = singletonScope;
    return target;
}
