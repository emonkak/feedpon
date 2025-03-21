import type { HasErrorReports } from '../context.ts';

export interface MaxItems {
  maxItems: number;
}

export function maxItems(
  value: unknown[],
  schema: MaxItems,
  context: HasErrorReports<Partial<MaxItems>>,
): boolean {
  const { maxItems } = schema;

  if (value.length > maxItems) {
    context.errorReports.push({
      error: `Array must have at most ${maxItems} items, but got ${value.length}.`,
      instanceLocation: '',
      keywordLocation: '/maxItems',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
