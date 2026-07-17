import type {
  ScrollController,
  ScrollEasingFunction,
  ScrollTarget,
} from '@feedpon/model';

interface ScrollState {
  aborted: boolean;
  previousTime: number;
  promise: Promise<void>;
}

export class SmoothScrollController implements ScrollController {
  private readonly _scrollStates: WeakMap<ScrollTarget, ScrollState> =
    new WeakMap();

  scrollTo(
    target: ScrollTarget,
    x: number,
    y: number,
    duration: number,
    easingFn: ScrollEasingFunction,
  ): Promise<void> {
    if (target instanceof Window) {
      const { scrollX, scrollY } = target;
      return this._startScroll(
        target,
        scrollX,
        scrollY,
        x,
        y,
        duration,
        easingFn,
      );
    } else {
      const { scrollLeft, scrollTop } = target;
      return this._startScroll(
        target,
        scrollLeft,
        scrollTop,
        x,
        y,
        duration,
        easingFn,
      );
    }
  }

  scrollBy(
    target: ScrollTarget,
    dx: number,
    dy: number,
    duration: number,
    easingFn: ScrollEasingFunction,
  ): Promise<void> {
    if (target instanceof Window) {
      const { scrollX, scrollY } = target;
      return this._startScroll(
        target,
        scrollX,
        scrollY,
        scrollX + dx,
        scrollY + dy,
        duration,
        easingFn,
      );
    } else {
      const { scrollLeft, scrollTop } = target;
      return this._startScroll(
        target,
        scrollLeft,
        scrollTop,
        scrollLeft + dx,
        scrollTop + dy,
        duration,
        easingFn,
      );
    }
  }

  scrollIntoView(
    target: Element,
    scrollDuration: number,
    easingFn: ScrollEasingFunction,
  ): Promise<void> {
    const style = window.getComputedStyle(target);
    const scrollMarginTop = parseFloat(style.scrollMarginTop) ?? 0;
    return this.scrollBy(
      window,
      0,
      target.getBoundingClientRect().top - scrollMarginTop,
      scrollDuration,
      easingFn,
    );
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
    easingFn: ScrollEasingFunction,
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

        const t = easingFn(progress);
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
