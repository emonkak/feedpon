import type { HasErrorReports } from '../context.ts';
import { quote } from '../helpers.ts';

export interface Required {
  required: readonly string[];
}

export function required(
  value: object,
  schema: Required,
  context: HasErrorReports<Partial<Required>>,
): boolean {
  const { required } = schema;
  let valid = true;

  for (const key of required) {
    if ((value as any)[key] === undefined) {
      context.errorReports.push({
        error: `Object must have property ${quote(key)}, but it is undefined.`,
        instanceLocation: '',
        keywordLocation: '/required',
        absoluteKeywordLocation: '',
        value,
        schema,
      });
      valid = false;
    }
  }

  return valid;
}
