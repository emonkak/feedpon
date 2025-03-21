import type { HasErrorReports } from '../context.ts';
import { deepEqual, show } from '../helpers.ts';

export interface Const {
  const: unknown;
}

export function constValue(
  value: unknown,
  schema: Const,
  context: HasErrorReports<Partial<Const>>,
): boolean {
  const { const: constValue } = schema;

  if (!deepEqual(constValue, value)) {
    context.errorReports.push({
      error: `Value must be ${show(constValue)}, but got ${show(value)}`,
      instanceLocation: '',
      keywordLocation: '/const',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
