import {
  type HasErrorReports,
  type HasSchemaConstraint,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface AllOf<TVocabulary> {
  allOf: readonly Schema<TVocabulary>[];
}

export function allOf<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: unknown,
  schema: TVocabulary & AllOf<TVocabulary>,
  context: TContext,
): boolean {
  const { allOf } = schema;
  const { schemaConstraint } = context;
  let matchCount = 0;

  for (let i = 0, l = allOf.length; i < l; i++) {
    const errorCount = context.errors.length;
    if (schemaConstraint(value, allOf[i]!, context)) {
      matchCount++;
    } else {
      fixKeywordLocations(context, errorCount, 'allOf', i.toString());
    }
  }

  return matchCount === allOf.length;
}
