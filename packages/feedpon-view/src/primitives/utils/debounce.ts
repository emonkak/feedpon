export function debounce<TCallback extends (...args: any[]) => void>(
  callback: TCallback,
  timeout: number,
): (this: ThisType<TCallback>, ...args: Parameters<TCallback>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args) {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      callback.call(this, args);
    }, timeout);
  };
}
