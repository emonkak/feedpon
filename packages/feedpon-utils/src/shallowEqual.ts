export default function shallowEqual<T extends {}>(
  first: T,
  second: T,
): boolean {
  if (first === second) {
    return true;
  }

  const firstKeys = Object.keys(first) as (keyof T)[];
  const secondKeys = Object.keys(second) as (keyof T)[];

  if (firstKeys.length !== secondKeys.length) {
    return false;
  }

  for (let i = 0, l = firstKeys.length; i < l; i++) {
    const key = firstKeys[i]!;
    if (!Object.hasOwn(second, key) || first[key] !== second[key]) {
      return false;
    }
  }

  return true;
}
