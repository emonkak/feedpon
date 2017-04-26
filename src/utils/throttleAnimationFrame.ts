export default function throttleAnimationFrame(handler: () => void): () => void {
    let request: number | null = null;

    const callback = () => {
        handler();

        request = null;
    };

    return () => {
        if (request == null) {
            request = window.requestAnimationFrame(callback);
        }
    };
}
