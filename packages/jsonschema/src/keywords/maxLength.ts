import type { HasErrorReports } from '../context.ts';

export interface MaxLength {
  maxLength: number;
}

export function maxLength(
  value: string,
  schema: MaxLength,
  context: HasErrorReports<Partial<MaxLength>>,
): boolean {
  const { maxLength } = schema;
  const length = value[Symbol.iterator]().reduce((length) => length + 1, 0);

  if (length > maxLength) {
    context.errors.push({
      error: `String must have at most ${maxLength} characters, but got ${value.length}.`,
      instanceLocation: '',
      keywordLocation: '/maxLength',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
