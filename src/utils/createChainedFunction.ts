export default function createChainedFunction(...fs: ((...args: any[]) => any)[]): (...args: any[]) => void {
    return (...args: any[]) => {
        fs.forEach(f => f && f(...args));
    };
}
