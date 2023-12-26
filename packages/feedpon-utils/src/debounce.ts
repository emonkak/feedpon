export default function debounce<TFunc extends (...args: any[]) => void>(
  func: TFunc,
  wait: number,
): (this: ThisType<TFunc>, ...args: Parameters<TFunc>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      func.call(this, args);
    }, wait);
  };
}
