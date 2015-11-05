const singletons = new WeakMap();
export function prototypeScope(instantiable) {
    return instantiable.instantiate();
}
export function singletonScope(instantiable) {
    const injectable = instantiable.injectable;
    if (singletons.has(injectable)) {
        return singletons.get(injectable);
    }
    const instance = instantiable.instantiate();
    singletons.set(injectable, instance);
    return instance;
}
