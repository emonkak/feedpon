import type { HasErrorReports } from '../context.ts';
import { deepEqual } from '../helpers.ts';

export interface UniqueItems {
  uniqueItems: boolean;
}

export function uniqueItems(
  value: unknown[],
  schema: UniqueItems,
  context: HasErrorReports<Partial<UniqueItems>>,
): boolean {
  const { uniqueItems } = schema;

  if (uniqueItems) {
    if (!unique(value)) {
      context.errorReports.push({
        error: 'Array items must be unique.',
        instanceLocation: '',
        keywordLocation: 'uniqueItems',
        absoluteKeywordLocation: '',
        value,
        schema,
      });
      return false;
    }
  }

  return true;
}

function unique<T>(items: T[]): boolean {
  for (let i = 0, l = items.length; i < l; i++) {
    for (let j = i + 1; j < l; j++) {
      if (deepEqual(items[i], items[j])) {
        return false;
      }
    }
  }
  return true;
}
