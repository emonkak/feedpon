export default function sequentialEqual<T>(
  first: ArrayLike<T>,
  second: ArrayLike<T>,
): boolean {
  if (first === second) {
    return true;
  }

  if (first.length !== second.length) {
    return false;
  }

  for (let i = 0, l = first.length; i < l; i++) {
    if (first[i] !== second[i]) {
      return false;
    }
  }

  return true;
}
