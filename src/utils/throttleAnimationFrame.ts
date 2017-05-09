export default function throttleAnimationFrame(handler: (...args: any[]) => void): () => void {
    let request: number | null = null;

    return (...args: any[]) => {
        if (request === null) {
            request = window.requestAnimationFrame(() => {
                handler(...args);

                request = null;
            });
        }
    };
}
