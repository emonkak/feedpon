import type { HasErrorReports } from '../context.ts';
import { quote } from '../helpers.ts';

export interface Pattern {
  pattern: string;
}

export function pattern(
  value: string,
  schema: Pattern,
  context: HasErrorReports<Partial<Pattern>>,
): boolean {
  const { pattern } = schema;
  const regexp = new RegExp(pattern);

  if (!regexp.test(value)) {
    context.errors.push({
      error: `String does not match the required pattern ${quote(pattern)}.`,
      instanceLocation: '',
      keywordLocation: '/pattern',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
