import {
  type HasErrorReports,
  type HasSchemaConstraint,
  fixInstanceLocations,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface PropertyNames<TVocabulary> {
  propertyNames: Schema<TVocabulary>;
}

export function propertyNames<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: object,
  schema: TVocabulary & PropertyNames<TVocabulary>,
  context: TContext,
): boolean {
  const { propertyNames } = schema;
  const { schemaConstraint } = context;
  let valid = true;

  for (const key of Object.keys(value)) {
    const errorCount = context.errors.length;

    if (!schemaConstraint(key, propertyNames, context)) {
      fixInstanceLocations(context, errorCount, key);
      fixKeywordLocations(context, errorCount, 'propertyNames', key);
      valid = false;
    }
  }

  return valid;
}
