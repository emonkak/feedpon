import type { HasErrorReports } from '../context.ts';

export interface MaxProperties {
  maxProperties: number;
}

export function maxProperties(
  value: object,
  schema: MaxProperties,
  context: HasErrorReports<Partial<MaxProperties>>,
): boolean {
  const { maxProperties } = schema;
  const keys = Object.keys(value);

  if (keys.length > maxProperties) {
    context.errors.push({
      error: `Object must have at most ${maxProperties} properties, but got ${keys.length}.`,
      instanceLocation: '',
      keywordLocation: '/maxProperties',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
