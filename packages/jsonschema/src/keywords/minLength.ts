import type { HasErrorReports } from '../context.ts';

export interface MinLength {
  minLength: number;
}

export function minLength(
  value: string,
  schema: MinLength,
  context: HasErrorReports<Partial<MinLength>>,
): boolean {
  const { minLength } = schema;
  const length = value[Symbol.iterator]().reduce((length) => length + 1, 0);

  if (length < minLength) {
    context.errors.push({
      error: `String must have at least ${minLength} characters, but got ${value.length}.`,
      instanceLocation: '',
      keywordLocation: '/minLength',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
