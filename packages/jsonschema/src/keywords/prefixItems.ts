import {
  type HasErrorReports,
  type HasEvaluatedLocations,
  type HasSchemaConstraint,
  fixInstanceLocations,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface PrefixItems<TVocabulary> {
  prefixItems: readonly Schema<TVocabulary>[];
}

export function prefixItems<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasEvaluatedLocations &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: unknown[],
  schema: TVocabulary & PrefixItems<TVocabulary>,
  context: TContext,
): boolean {
  const { prefixItems } = schema;
  const { evaluatedLocations, schemaConstraint } = context;
  let valid = true;

  for (let i = 0, l = Math.min(prefixItems.length, value.length); i < l; i++) {
    const subContext = {
      ...context,
      evaluatedLocations: { index: -1, properties: null },
    };
    const errorCount = context.errorReports.length;

    if (!schemaConstraint(value[i], prefixItems[i]!, subContext)) {
      fixInstanceLocations(context, errorCount, i.toString());
      fixKeywordLocations(context, errorCount, 'prefixItems', i.toString());
      valid = false;
    }
  }

  evaluatedLocations.index = Math.max(
    evaluatedLocations.index,
    Math.min(prefixItems.length, value.length) - 1,
  );

  return valid;
}
