import {
  fixKeywordLocations,
  type HasErrorReports,
  type HasSchemaConstraint,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface OneOf<TVocabulary> {
  oneOf: readonly Schema<TVocabulary>[];
}

export function oneOf<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: unknown,
  schema: TVocabulary & OneOf<TVocabulary>,
  context: TContext,
): boolean {
  const { oneOf } = schema;
  const { schemaConstraint } = context;
  const subContext = { ...context, errors: [] };
  let matchCount = 0;

  for (let i = 0, l = oneOf.length; i < l; i++) {
    if (schemaConstraint(value, oneOf[i]!, subContext)) {
      matchCount++;
    }
  }

  if (matchCount === 0) {
    fixKeywordLocations(subContext, 0, 'oneOf');
    context.errors.push(...subContext.errors);
    return false;
  } else if (matchCount > 1) {
    context.errors.push({
      error: 'Value matches multiple schemas, but only one is allowed.',
      instanceLocation: '',
      keywordLocation: '/oneOf',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
