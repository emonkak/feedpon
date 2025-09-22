export function throttle<TCallback extends (...args: any[]) => void>(
  callback: TCallback,
  timeout: number,
): (this: ThisType<TCallback>, ...args: Parameters<TCallback>) => void {
  let tailTimer: ReturnType<typeof setTimeout> | null = null;
  let lastInvoked = 0;

  return function (...args) {
    if (tailTimer !== null) {
      return;
    }

    const now = Date.now();

    if (now - lastInvoked >= timeout) {
      callback.call(this, args);
      lastInvoked = now;
    } else {
      tailTimer = setTimeout(() => {
        callback.call(this, args);
        lastInvoked = Date.now();
        tailTimer = null;
      }, timeout);
    }
  };
}
