import singletonScope from '../scopes/singletonScope';

export default function Singleton(target: any): any {
    target.$scope = singletonScope;
    return target;
}
