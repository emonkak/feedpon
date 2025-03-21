export function deepEqual<T>(first: T, second: T): boolean {
  if (Object.is(first, second)) {
    return true;
  }

  if (
    first === null ||
    second === null ||
    typeof first !== 'object' ||
    typeof second !== 'object'
  ) {
    return false;
  }

  const firstKeys = Object.keys(first) as (keyof T)[];
  const secondKeys = Object.keys(second) as (keyof T)[];

  if (firstKeys.length !== secondKeys.length) {
    return false;
  }

  for (let i = 0, l = firstKeys.length; i < l; i++) {
    const key = firstKeys[i]!;
    if (!Object.hasOwn(second, key) || !deepEqual(first[key], second[key])) {
      return false;
    }
  }

  return true;
}

export function quote(s: string): string {
  return '"' + s.replaceAll('"', '\\"') + '"';
}

export function show(value: unknown): string {
  switch (typeof value) {
    case 'boolean':
    case 'number':
      return value.toString();
    case 'string':
      return quote(value);
    case 'object':
      if (
        value === null ||
        value.constructor === Array ||
        value.constructor === Object
      ) {
        return JSON.stringify(value);
      } else {
        return (
          (value as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] ??
          value.constructor.name
        );
      }
    case 'undefined':
      return typeof undefined;
    case 'function':
      return value.name !== '' ? value.name : value.constructor.name;
    default: // bigint or symbol
      return value!.constructor.name;
  }
}
