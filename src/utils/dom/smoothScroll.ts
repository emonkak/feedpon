const SCROLL_TIME = 200;

export default function smoothScroll(el: HTMLElement, x: number, y: number): Promise<void> {
    let scrollable: Window | HTMLElement;
    let startX: number;
    let startY: number;
    let scroll: (this: Window | HTMLElement, x: number, y: number) => void;

    if (el === el.ownerDocument.body) {
        scrollable = window;
        startX = window.scrollX;
        startY = window.scrollY;
        scroll = window.scrollTo;
    } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        scroll = scrollElement;
    }

    const startTime = window.performance.now();

    if (startX === x && startY === y) {
        return Promise.resolve();
    }

    return start(scrollable, scroll, startTime, startX, startY, x, y);
}

function start(
    scrollable: Window | HTMLElement,
    scroll: (this: Window | HTMLElement, x: number, y: number) => void,
    startTime: number,
    startX: number,
    startY: number,
    x: number,
    y: number
): Promise<void> {
    return new Promise<any>((resolve) => {
        function step() {
            const time = window.performance.now();
            const elapsed = Math.min(1.0, (time - startTime) / SCROLL_TIME);

            const delta = ease(elapsed);
            const currentX = startX + (x - startX) * delta;
            const currentY = startY + (y - startY) * delta;

            scroll.call(scrollable, currentX, currentY);

            if (currentX === x && currentY === y) {
                window.requestAnimationFrame(resolve);
                return;
            }

            window.requestAnimationFrame(step);
        }

        step();
    });
}

function scrollElement(this: HTMLElement, x: number, y: number) {
    this.scrollLeft = x;
    this.scrollTop = y;
}

function ease(k: number) {
    return 0.5 * (1 - Math.cos(Math.PI * k));
}
