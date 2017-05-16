export default function createChainedFunction(...funcs: (((...args: any[]) => any) | undefined | null)[]): (...args: any[]) => void {
    return funcs
        .filter(func => func != null)
        .reduce<((...args: any[]) => void)>((acc, func) => {
            if (acc === emptyFunction) {
                return func!;
            }

            return function chainedFunction(this: any, ...args) {
                acc.apply(this, args);
                func!.apply(this, args);
            };
        }, emptyFunction);
}

function emptyFunction() {
}
