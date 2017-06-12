export default function throttleIdleCallback(handler: (...args: any[]) => void): () => void {
    let request: number | null = null;

    const requestIdleCallback = window.requestIdleCallback || window.setTimeout;

    return (...args: any[]) => {
        if (request === null) {
            request = requestIdleCallback(() => {
                handler(...args);

                request = null;
            });
        }
    };
}

