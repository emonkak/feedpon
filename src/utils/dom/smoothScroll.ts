const runningAnimations = new WeakMap<object, { requestId: number, progress: number }>();

export function smoothScrollTo(el: HTMLElement, x: number, y: number, duration: number): Promise<void> {
    if (el === el.ownerDocument.body) {
        const w = el.ownerDocument.defaultView;
        const startX = w.scrollX;
        const startY = w.scrollY;
        return smoothScroll(w, scrollWindow, startX, startY, x, y, duration);
    } else {
        const startX = el.scrollLeft;
        const startY = el.scrollTop;
        return smoothScroll(el, scrollElement, startX, startY, x, y, duration);
    }
}

export function smoothScrollBy(el: HTMLElement, dx: number, dy: number, duration: number): Promise<void> {
    if (el === el.ownerDocument.body) {
        const w = el.ownerDocument.defaultView;
        const x = w.scrollX;
        const y = w.scrollY;
        return smoothScroll(w, scrollWindow, x, y, x + dx, y + dy, duration);
    } else {
        const x = el.scrollLeft;
        const y = el.scrollTop;
        return smoothScroll(el, scrollElement, x, y, x + dx, y + dy, duration);
    }
}

function smoothScroll<TScrollable extends object>(
    scrollable: TScrollable,
    scroll: (scrollable: TScrollable, x: number, y: number) => void,
    startX: number,
    startY: number,
    x: number,
    y: number,
    duration: number
): Promise<void> {
    if (startX === x && startY === y) {
        return Promise.resolve();
    }

    const runningAnimation = runningAnimations.get(scrollable);
    const initialProgress = runningAnimation ? Math.min(0.5, runningAnimation.progress) : 0;
    const startTime = performance.now();

    return new Promise((resolve) => {
        const step = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - startTime;
            const progress = initialProgress + deltaTime / duration;

            if (progress > 1) {
                scroll(scrollable, x, y);
                runningAnimations.delete(scrollable);
                resolve();
                return;
            }

            const deltaFactor = ease(progress);
            const currentX = startX + (x - startX) * deltaFactor;
            const currentY = startY + (y - startY) * deltaFactor;

            scroll(scrollable, currentX, currentY);

            const requestId = requestAnimationFrame(step);

            runningAnimations.set(scrollable, { progress, requestId });
        }

        if (runningAnimation) {
            cancelAnimationFrame(runningAnimation.requestId);
            requestAnimationFrame(step);
        } else {
            step();
        }
    });
}

function scrollElement(el: HTMLElement, x: number, y: number): void {
    el.scrollLeft = x;
    el.scrollTop = y;
}

function scrollWindow(w: Window, x: number, y: number): void {
    w.scrollTo(x, y);
}

function ease(t: number): number {
    return 0.5 - Math.cos(t * Math.PI) / 2;
}
