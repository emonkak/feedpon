const runningAnimations = new WeakMap<
  object,
  { requestId: number; time: number }
>();

const DEFAULT_DURATION = (1000 / 60) * 10;

export function smoothScrollTo(
  el: HTMLElement | Window,
  x: number,
  y: number,
  duration: number = DEFAULT_DURATION,
): Promise<void> {
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

export function smoothScrollBy(
  el: HTMLElement | Window,
  dx: number,
  dy: number,
  duration: number = DEFAULT_DURATION,
): Promise<void> {
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

export function isScrolling(scrollable: object): boolean {
  return runningAnimations.has(scrollable);
}

function smoothScroll<TScrollable extends object>(
  scrollable: TScrollable,
  scroll: (scrollable: TScrollable, x: number, y: number) => void,
  startX: number,
  startY: number,
  x: number,
  y: number,
  duration: number,
): Promise<void> {
  const runningAnimation = runningAnimations.get(scrollable);

  if (runningAnimation) {
    cancelAnimationFrame(runningAnimation.requestId);
  }

  if (startX === x && startY === y) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let startTime = runningAnimation
      ? Math.min(runningAnimation.time - duration / 2, runningAnimation.time)
      : null;

    const step = (time: number) => {
      if (startTime) {
        const delta = time - startTime;
        const progress = delta / duration;

        if (progress >= 1.0) {
          scroll(scrollable, x, y);
          runningAnimations.delete(scrollable);
          resolve();
          return;
        }

        const factor = ease(progress);
        const nextX = startX + (x - startX) * factor;
        const nextY = startY + (y - startY) * factor;

        scroll(scrollable, nextX, nextY);
      } else {
        startTime = time;
      }

      const requestId = requestAnimationFrame(step);

      runningAnimations.set(scrollable, { requestId, time });
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
