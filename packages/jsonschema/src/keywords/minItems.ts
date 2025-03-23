import type { HasErrorReports } from '../context.ts';

export interface MinItems {
  minItems: number;
}

export function minItems(
  value: unknown[],
  schema: MinItems,
  context: HasErrorReports<Partial<MinItems>>,
): boolean {
  const { minItems } = schema;

  if (value.length < minItems) {
    context.errors.push({
      error: `Array must have at least ${minItems} items, but got ${value.length}.`,
      instanceLocation: '',
      keywordLocation: '/minItems',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
