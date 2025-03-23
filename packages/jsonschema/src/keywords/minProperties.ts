import type { HasErrorReports } from '../context.ts';

export interface MinProperties {
  minProperties: number;
}

export function minProperties(
  value: object,
  schema: MinProperties,
  context: HasErrorReports<Partial<MinProperties>>,
): boolean {
  const { minProperties } = schema;
  const keys = Object.keys(value);

  if (keys.length < minProperties) {
    context.errors.push({
      error: `Object must have at least ${minProperties} properties, but got ${keys.length}.`,
      instanceLocation: '',
      keywordLocation: '/minProperties',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
