export default function createChainedFunction(...funcs: ((() => void) | undefined | null)[]): () => void;
export default function createChainedFunction<T1>(...funcs: (((v1: T1) => void) | undefined | null)[]): (v1: T1) => void;
export default function createChainedFunction<T1, T2>(...funcs: (((v1: T1, v2: T2) => void) | undefined | null)[]): (v1: T1, v2: T2) => void;
export default function createChainedFunction<T1, T2, T3>(...funcs: (((v1: T1, v2: T2, v3: T3) => void) | undefined | null)[]): (v1: T1, v2: T2, v3: T3) => void;
export default function createChainedFunction(...funcs: (((...args: any[]) => void) | undefined | null)[]): (...args: any[]) => void {
    return funcs.reduce<((...args: any[]) => void)>((acc, func) => {
        if (func == null) {
            return acc;
        }

        if (acc === emptyFunction) {
            return func;
        }

        return function chainedFunction(this: any, ...args) {
            acc.apply(this, args);
            func.apply(this, args);
        };
    }, emptyFunction);
}

function emptyFunction() {
}
