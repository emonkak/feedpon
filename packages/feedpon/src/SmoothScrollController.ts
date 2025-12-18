import type { ScrollEasing, ScrollTarget } from 'feedpon-store';

interface ScrollState {
  aborted: boolean;
  previousTime: number;
  promise: Promise<void>;
}

export class SmoothScrollController {
  private readonly _scrollStates: WeakMap<ScrollTarget, ScrollState> =
    new WeakMap();

  scrollTo(
    target: ScrollTarget,
    destX: number,
    destY: number,
    duration: number,
    easing: ScrollEasing,
  ): Promise<void> {
    if (target instanceof Window) {
      const srcX = target.scrollX;
      const srcY = target.scrollY;
      return this._startScroll(
        target,
        srcX,
        srcY,
        destX,
        destY,
        duration,
        easing,
      );
    } else {
      const srcX = target.scrollLeft;
      const srcY = target.scrollTop;
      return this._startScroll(
        target,
        srcX,
        srcY,
        destX,
        destY,
        duration,
        easing,
      );
    }
  }

  scrollBy(
    target: ScrollTarget,
    dx: number,
    dy: number,
    duration: number,
    easing: ScrollEasing,
  ): Promise<void> {
    if (target instanceof Window) {
      const srcX = target.scrollX;
      const srcY = target.scrollY;
      return this._startScroll(
        target,
        srcX,
        srcY,
        srcX + dx,
        srcY + dy,
        duration,
        easing,
      );
    } else {
      const srcX = target.scrollLeft;
      const srcY = target.scrollTop;
      return this._startScroll(
        target,
        srcX,
        srcY,
        srcX + dx,
        srcY + dy,
        duration,
        easing,
      );
    }
  }

  async waitForScroll(scrollable: ScrollTarget): Promise<void> {
    let scrollState: ScrollState | undefined;

    while ((scrollState = this._scrollStates.get(scrollable))) {
      await scrollState.promise;
    }
  }

  private _startScroll(
    target: ScrollTarget,
    srcX: number,
    srcY: number,
    destX: number,
    destY: number,
    duration: number,
    easing: ScrollEasing,
  ): Promise<void> {
    let scrollState = this._scrollStates.get(target);

    if (scrollState !== undefined) {
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
          this._scrollStates.delete(target);
          resolve();
          return;
        }

        const progress = Math.max(currentTime - startTime, 0) / duration;

        if (progress >= 1.0) {
          target.scrollTo(destX, destY);
          this._scrollStates.delete(target);
          resolve();
          return;
        }

        const t = easing(progress);
        const x = srcX + (destX - srcX) * t;
        const y = srcY + (destY - srcY) * t;

        target.scrollTo(x, y);

        scrollState!.previousTime = currentTime;

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });

    scrollState = {
      aborted: false,
      previousTime: startTime,
      promise,
    };

    this._scrollStates.set(target, scrollState);

    return promise;
  }
}
