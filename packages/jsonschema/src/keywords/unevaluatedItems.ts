import {
  type HasErrorReports,
  type HasEvaluatedLocations,
  type HasSchemaConstraint,
  fixInstanceLocations,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface UnevaluatedItems<TVocabulary> {
  unevaluatedItems: Schema<TVocabulary>;
}

export function unevaluatedItems<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasSchemaConstraint<TVocabulary, TContext> &
    HasEvaluatedLocations,
>(
  value: unknown[],
  schema: UnevaluatedItems<TVocabulary>,
  context: TContext,
): boolean {
  const { unevaluatedItems } = schema;
  const { evaluatedLocations, schemaConstraint } = context;
  let valid = true;

  for (let i = evaluatedLocations.index + 1, l = value.length; i < l; i++) {
    const subContext = {
      ...context,
      evaluatedLocations: { index: -1, properties: null },
    };
    const errorCount = context.errors.length;

    if (!schemaConstraint(value[i], unevaluatedItems, subContext)) {
      fixInstanceLocations(context, errorCount, i.toString());
      fixKeywordLocations(context, errorCount, 'unevaluatedItems');
      valid = false;
    }
  }

  evaluatedLocations.index = value.length - 1;

  return valid;
}
