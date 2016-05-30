import prototypeScope from '../scope/singletonScope';

export default function Prototype(target: any): any {
    target.$scope = prototypeScope;
    return target;
}
