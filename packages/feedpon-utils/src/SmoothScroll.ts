type Scrollable = Window | Element;

type EasingFunc = (t: number) => number;

interface ScrollState {
  frame: number;
  previousTime: number;
}

const scrollStates = new WeakMap<Scrollable, ScrollState>();

export function scrollTo(
  scrollable: Scrollable,
  destX: number,
  destY: number,
  easing: EasingFunc,
  duration: number,
): Promise<void> {
  if (scrollable instanceof Window) {
    const srcX = scrollable.scrollX;
    const srcY = scrollable.scrollY;
    return smoothScroll(scrollable, srcX, srcY, destX, destY, easing, duration);
  } else {
    const srcX = scrollable.scrollLeft;
    const srcY = scrollable.scrollTop;
    return smoothScroll(scrollable, srcX, srcY, destX, destY, easing, duration);
  }
}

export function scrollBy(
  scrollable: Scrollable,
  dx: number,
  dy: number,
  easing: EasingFunc,
  duration: number,
): Promise<void> {
  if (scrollable instanceof Window) {
    const srcX = scrollable.scrollX;
    const srcY = scrollable.scrollY;
    return smoothScroll(
      scrollable,
      srcX,
      srcY,
      srcX + dx,
      srcY + dy,
      easing,
      duration,
    );
  } else {
    const srcX = scrollable.scrollLeft;
    const srcY = scrollable.scrollTop;
    return smoothScroll(
      scrollable,
      srcX,
      srcY,
      srcX + dx,
      srcY + dy,
      easing,
      duration,
    );
  }
}

export function isScrolling(scrollable: Scrollable): boolean {
  return scrollStates.has(scrollable);
}

function smoothScroll(
  scrollable: Scrollable,
  srcX: number,
  srcY: number,
  destX: number,
  destY: number,
  easing: EasingFunc,
  duration: number,
): Promise<void> {
  const scrollState = scrollStates.get(scrollable);

  if (scrollState) {
    cancelAnimationFrame(scrollState.frame);
  }

  if (srcX === destX && srcY === destY) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const startTime = scrollState
      ? scrollState.previousTime - duration / 2
      : performance.now();

    const step = (currentTime: number) => {
      const progress = Math.max(currentTime - startTime, 0) / duration;

      if (progress >= 1.0) {
        scrollable.scrollTo(destX, destY);
        scrollStates.delete(scrollable);
        resolve();
        return;
      }

      const t = easing(progress);
      const x = srcX + (destX - srcX) * t;
      const y = srcY + (destY - srcY) * t;

      scrollable.scrollTo(x, y);

      const frame = requestAnimationFrame(step);

      scrollStates.set(scrollable, { frame, previousTime: currentTime });
    };

    requestAnimationFrame(step);
  });
}
