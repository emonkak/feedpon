import {
  fixInstanceLocations,
  fixKeywordLocations,
  type HasErrorReports,
  type HasEvaluatedLocations,
  type HasSchemaConstraint,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface Items<TVocabulary> {
  items: Schema<TVocabulary>;
  prefixItems?: readonly (TVocabulary | boolean)[];
}

export function items<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasEvaluatedLocations &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: unknown[],
  schema: TVocabulary & Items<TVocabulary>,
  context: TContext,
): boolean {
  const { items, prefixItems } = schema;
  const { evaluatedLocations, schemaConstraint } = context;
  let valid = true;

  for (let i = prefixItems?.length ?? 0, l = value.length; i < l; i++) {
    const errorCount = context.errors.length;

    if (!schemaConstraint(value[i], items, context)) {
      fixInstanceLocations(context, errorCount, i.toString());
      fixKeywordLocations(context, errorCount, 'items');
      valid = false;
    }
  }

  evaluatedLocations.index = value.length - 1;

  return valid;
}
