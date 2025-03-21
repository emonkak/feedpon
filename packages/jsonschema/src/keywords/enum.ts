import type { HasErrorReports } from '../context.ts';
import { deepEqual, show } from '../helpers.ts';

export interface Enum {
  enum: readonly unknown[];
}

export function enumValues(
  value: unknown,
  schema: Enum,
  context: HasErrorReports<Partial<Enum>>,
): boolean {
  const { enum: enumValues } = schema;

  if (!enumValues.some((enumValue) => deepEqual(value, enumValue))) {
    context.errorReports.push({
      error: `Value must be one of ${enumValues.map(show).join(', ')}, but got ${show(value)}.`,
      instanceLocation: '',
      keywordLocation: '/enum',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
