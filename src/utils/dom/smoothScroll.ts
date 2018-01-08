const runningAnimations = new WeakMap<object, { requestId: number, progress: number }>();

const DEFAULT_DURATION = 1000 / 60 * 10;

export function smoothScrollTo(el: HTMLElement | Window, x: number, y: number, duration: number = DEFAULT_DURATION): Promise<void> {
    if (el instanceof Window) {
        const startX = el.scrollX;
        const startY = el.scrollY;
        return smoothScroll(el, scrollWindow, startX, startY, x, y, duration);
    } else {
        const startX = el.scrollLeft;
        const startY = el.scrollTop;
        return smoothScroll(el, scrollElement, startX, startY, x, y, duration);
    }
}

export function smoothScrollBy(el: HTMLElement | Window, dx: number, dy: number, duration: number = DEFAULT_DURATION): Promise<void> {
    if (el instanceof Window) {
        const x = el.scrollX;
        const y = el.scrollY;
        return smoothScroll(el, scrollWindow, x, y, x + dx, y + dy, duration);
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
    const runningAnimation = runningAnimations.get(scrollable);

    if (runningAnimation) {
        cancelAnimationFrame(runningAnimation.requestId);
        runningAnimations.delete(scrollable);
    }

    if (startX === x && startY === y) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const initialProgress = runningAnimation ? Math.min(0.5, runningAnimation.progress) : 0;
        const startTime = performance.now();

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
        };

        requestAnimationFrame(step);
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
