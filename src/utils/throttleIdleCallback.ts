export default function throttleIdleCallback(handler: (...args: any[]) => void): () => void {
    let request: number | null = null;

    const requestIdleCallback = window.requestIdleCallback || window.setTimeout;

    return function(this: any, ...args: any[]) {
        if (request === null) {
            request = requestIdleCallback(() => {
                handler.apply(this, args);

                request = null;
            });
        }
    };
}
