import type { HasErrorReports } from '../context.ts';

export interface Minimum {
  minimum: number;
}

export function minimum(
  value: number,
  schema: Minimum,
  context: HasErrorReports<Partial<Minimum>>,
): boolean {
  const { minimum } = schema;

  if (value < minimum) {
    context.errorReports.push({
      error: `Number must be at least ${minimum}, but got ${value}.`,
      instanceLocation: '',
      keywordLocation: '/minimum',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
