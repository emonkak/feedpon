type Scrollable = Window | Element;

type EasingFunc = (t: number) => number;

interface ScrollState {
  previousTime: number;
  promise: Promise<void>;
  aborted: boolean;
}

const globalScrollStates = new WeakMap<Scrollable, ScrollState>();

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

export function abortScroll(scrollable: Scrollable): void {
  const scrollState = globalScrollStates.get(scrollable);
  if (scrollState) {
    scrollState.aborted = true;
  }
}

export function isScrolling(scrollable: Scrollable): boolean {
  const scrollState = globalScrollStates.get(scrollable);
  return scrollState ? !scrollState.aborted : false;
}

export async function scrollLock(scrollable: Scrollable): Promise<void> {
  let scrollState;

  while ((scrollState = globalScrollStates.get(scrollable))) {
    await scrollState.promise;
  }
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
  let scrollState = globalScrollStates.get(scrollable);

  if (scrollState) {
    scrollState.aborted = true;
  }

  if (srcX === destX && srcY === destY) {
    return Promise.resolve();
  }

  const startTime = scrollState
    ? scrollState.previousTime - duration / 2
    : performance.now();

  const promise = new Promise<void>((resolve) => {
    const step = (currentTime: number) => {
      if (scrollState!.aborted) {
        globalScrollStates.delete(scrollable);
        resolve();
        return;
      }

      const progress = Math.max(currentTime - startTime, 0) / duration;

      if (progress >= 1.0) {
        scrollable.scrollTo(destX, destY);
        globalScrollStates.delete(scrollable);
        resolve();
        return;
      }

      const t = easing(progress);
      const x = srcX + (destX - srcX) * t;
      const y = srcY + (destY - srcY) * t;

      scrollable.scrollTo(x, y);

      scrollState!.previousTime = currentTime;

      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  });

  scrollState = {
    promise,
    previousTime: startTime,
    aborted: false,
  };

  globalScrollStates.set(scrollable, scrollState);

  return promise;
}
