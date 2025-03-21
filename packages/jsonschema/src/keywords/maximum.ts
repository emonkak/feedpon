import type { HasErrorReports } from '../context.ts';

export interface Maximum {
  maximum: number;
}

export function maximum(
  value: number,
  schema: Maximum,
  context: HasErrorReports<Partial<Maximum>>,
): boolean {
  const { maximum } = schema;

  if (value > maximum) {
    context.errorReports.push({
      error: `Number must be at most ${maximum}, but got ${value}.`,
      instanceLocation: '',
      keywordLocation: '/maximum',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
