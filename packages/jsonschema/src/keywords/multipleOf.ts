import type { HasErrorReports } from '../context.ts';

export interface MultipleOf {
  multipleOf: number;
}

export function multipleOf(
  value: number,
  schema: MultipleOf,
  context: HasErrorReports<Partial<MultipleOf>>,
): boolean {
  const { multipleOf } = schema;

  if (Math.floor(value % multipleOf) !== 0) {
    context.errors.push({
      error: `Number must be a multiple of ${multipleOf}, but got ${value}.`,
      instanceLocation: '',
      keywordLocation: '/multipleOf',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
