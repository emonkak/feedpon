declare module 'object.values' {
    import getPolyfill  from 'object.values/polyfill';
    import implementation  from 'object.values/implementation';
    import shim  from 'object.values/shim';

    export {
        getPolyfill,
        implementation,
        shim
    };
}

declare module 'object.values/implementation' {
    export = typeof Object.values;
}

declare module 'object.values/polyfill' {
    function ObjectValuesPolyfill(): typeof Object.values;

    export = ObjectValuesPolyfill;
}

declare module 'object.values/shim' {
    function ObjectValuesShim(): typeof Object.values;

    export = ObjectValuesShim;
}
