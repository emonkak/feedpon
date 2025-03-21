import type { HasErrorReports } from '../context.ts';

export interface ExclusiveMinimum {
  exclusiveMinimum: number;
}

export function exclusiveMinimum(
  value: number,
  schema: ExclusiveMinimum,
  context: HasErrorReports<Partial<ExclusiveMinimum>>,
): boolean {
  const { exclusiveMinimum } = schema;

  if (value <= exclusiveMinimum) {
    context.errorReports.push({
      error: `Number must be greater than ${exclusiveMinimum}, but got ${value}.`,
      instanceLocation: '',
      keywordLocation: '/exclusiveMinimum',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
