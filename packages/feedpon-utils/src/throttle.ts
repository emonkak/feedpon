export default function throttle<TFunc extends (...args: any[]) => void>(
  func: TFunc,
  timeFrame: number,
): (this: ThisType<TFunc>, ...args: Parameters<TFunc>) => void {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= timeFrame) {
      func.call(this, args);
      lastTime = now;
    }
  };
}
