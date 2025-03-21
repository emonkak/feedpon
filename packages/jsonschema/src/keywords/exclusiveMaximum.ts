import type { HasErrorReports } from '../context.ts';

export interface ExclusiveMaximum {
  exclusiveMaximum: number;
}

export function exclusiveMaximum(
  value: number,
  schema: ExclusiveMaximum,
  context: HasErrorReports<Partial<ExclusiveMaximum>>,
): boolean {
  const { exclusiveMaximum } = schema;

  if (value >= exclusiveMaximum) {
    context.errorReports.push({
      error: `Number must be less than ${exclusiveMaximum}, but got ${value}.`,
      instanceLocation: '',
      keywordLocation: '/exclusiveMaximum',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
