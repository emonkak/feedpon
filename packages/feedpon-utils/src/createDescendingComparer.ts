export default function createDescendingComparer<T>(
  key: keyof T,
): (x: T, y: T) => number {
  return (x: T, y: T): number => {
    const n = x[key];
    const m = y[key];
    if (n < m) {
      return 1;
    }
    if (n > m) {
      return -1;
    }
    return 0;
  };
}
