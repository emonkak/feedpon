export default function throttleAnimationFrame(handler: (...args: any[]) => void): () => void {
    let request: number | null = null;

    const requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;

    return (...args: any[]) => {
        if (request === null) {
            request = requestAnimationFrame(() => {
                handler(...args);

                request = null;
            });
        }
    };
}
