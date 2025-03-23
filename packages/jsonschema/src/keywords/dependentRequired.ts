import type { HasErrorReports } from '../context.ts';
import { quote } from '../helpers.ts';
import { escapeJSONPointerComponent } from '../pointer.ts';

export interface DependentRequired {
  dependentRequired: Record<string, string[]>;
}

export function dependentRequired(
  value: object,
  schema: DependentRequired,
  context: HasErrorReports<Partial<DependentRequired>>,
): boolean {
  const { dependentRequired } = schema;
  let valid = true;

  for (const key of Object.keys(dependentRequired)) {
    if ((value as any)[key] === undefined) {
      continue;
    }
    const dependentKeys = dependentRequired[key]!;
    if (
      !dependentKeys.every(
        (dependentKey) => (value as any)[dependentKey] !== undefined,
      )
    ) {
      context.errors.push({
        error: `Object must have property ${quote(key)} when ${dependentKeys.map(quote).join(', ')} ${dependentKeys.length > 1 ? 'are' : 'is'} present, but it is undefined.`,
        instanceLocation: '',
        keywordLocation:
          '/dependentRequired/' + escapeJSONPointerComponent(key),
        absoluteKeywordLocation: '',
        value,
        schema,
      });
      valid = false;
    }
  }

  return valid;
}
