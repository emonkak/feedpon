import {
  type HasErrorReports,
  type HasSchemaConstraint,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface AnyOf<TVocabulary> {
  anyOf: readonly Schema<TVocabulary>[];
}

export function anyOf<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: unknown,
  schema: TVocabulary & AnyOf<TVocabulary>,
  context: TContext,
): boolean {
  const { anyOf } = schema;
  const { schemaConstraint } = context;
  const subContext = { ...context, errorReports: [] };
  let matchCount = 0;

  for (let i = 0, l = anyOf.length; i < l; i++) {
    if (schemaConstraint(value, anyOf[i]!, subContext)) {
      matchCount++;
    }
  }

  if (matchCount === 0) {
    fixKeywordLocations(subContext, 0, 'anyOf');
    context.errorReports.push(...subContext.errorReports);
    return false;
  }

  return true;
}
