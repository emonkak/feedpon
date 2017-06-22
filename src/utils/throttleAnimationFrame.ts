export default function throttleAnimationFrame(handler: (...args: any[]) => void): () => void {
    let request: number | null = null;

    const requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;

    return function(this: any, ...args: any[]) {
        if (request === null) {
            request = requestAnimationFrame(() => {
                handler.apply(this, args);

                request = null;
            });
        }
    };
}
