export default function throttle<TFunc extends (...args: any[]) => void>(
  func: TFunc,
  timeFrame: number,
): (this: ThisType<TFunc>, ...args: Parameters<TFunc>) => void {
  let tailTimer: ReturnType<typeof setTimeout> = 0;
  let lastInvoked = 0;

  return function (...args) {
    if (tailTimer > 0) {
      return;
    }

    const now = Date.now();

    if (now - lastInvoked >= timeFrame) {
      func.call(this, args);
      lastInvoked = now;
    } else {
      tailTimer = setTimeout(() => {
        func.call(this, args);
        lastInvoked = Date.now();
        tailTimer = 0;
      }, timeFrame);
    }
  };
}
