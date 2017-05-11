function emptyFunction() {
}

export default function createChainedFunction(...fs: (((...args: any[]) => any) | undefined | null)[]): (...args: any[]) => void {
    const gs = fs.filter(f => !!f);

    if (gs.length === 0) {
        return emptyFunction;
    }

    if (gs.length === 1) {
        return gs[0]!;
    }

    return function chainedFunction(...args: any[]) {
        for (const g of gs) {
            g!(...args);
        }
    };
}
