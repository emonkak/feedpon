export type Scrollable = Window | Element;

export type ScrollEasing = (t: number) => number;

interface ScrollState {
  aborted: boolean;
  previousTime: number;
  promise: Promise<void>;
}

export class SmoothScroll {
  private readonly _scrollStates: WeakMap<Scrollable, ScrollState> =
    new WeakMap();

  scrollTo(
    scrollable: Scrollable,
    destX: number,
    destY: number,
    duration: number,
    scrollEasing: ScrollEasing,
  ): Promise<void> {
    if (scrollable instanceof Window) {
      const srcX = scrollable.scrollX;
      const srcY = scrollable.scrollY;
      return this._startScroll(
        scrollable,
        srcX,
        srcY,
        destX,
        destY,
        scrollEasing,
        duration,
      );
    } else {
      const srcX = scrollable.scrollLeft;
      const srcY = scrollable.scrollTop;
      return this._startScroll(
        scrollable,
        srcX,
        srcY,
        destX,
        destY,
        scrollEasing,
        duration,
      );
    }
  }

  scrollBy(
    scrollable: Scrollable,
    dx: number,
    dy: number,
    duration: number,
    scrollEasing: ScrollEasing,
  ): Promise<void> {
    if (scrollable instanceof Window) {
      const srcX = scrollable.scrollX;
      const srcY = scrollable.scrollY;
      return this._startScroll(
        scrollable,
        srcX,
        srcY,
        srcX + dx,
        srcY + dy,
        scrollEasing,
        duration,
      );
    } else {
      const srcX = scrollable.scrollLeft;
      const srcY = scrollable.scrollTop;
      return this._startScroll(
        scrollable,
        srcX,
        srcY,
        srcX + dx,
        srcY + dy,
        scrollEasing,
        duration,
      );
    }
  }

  async waitForScroll(scrollable: Scrollable): Promise<void> {
    let scrollState: ScrollState | undefined;

    while ((scrollState = this._scrollStates.get(scrollable))) {
      await scrollState.promise;
    }
  }

  private _startScroll(
    scrollable: Scrollable,
    srcX: number,
    srcY: number,
    destX: number,
    destY: number,
    scrollEasing: ScrollEasing,
    duration: number,
  ): Promise<void> {
    let scrollState = this._scrollStates.get(scrollable);

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
          this._scrollStates.delete(scrollable);
          resolve();
          return;
        }

        const progress = Math.max(currentTime - startTime, 0) / duration;

        if (progress >= 1.0) {
          scrollable.scrollTo(destX, destY);
          this._scrollStates.delete(scrollable);
          resolve();
          return;
        }

        const t = scrollEasing(progress);
        const x = srcX + (destX - srcX) * t;
        const y = srcY + (destY - srcY) * t;

        scrollable.scrollTo(x, y);

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

    this._scrollStates.set(scrollable, scrollState);

    return promise;
  }
}
