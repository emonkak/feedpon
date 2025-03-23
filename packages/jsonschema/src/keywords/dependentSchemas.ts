import {
  type HasErrorReports,
  type HasSchemaConstraint,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface DependentSchemas<TVocabulary> {
  dependentSchemas: Record<string, Schema<TVocabulary>>;
}

export function dependentSchemas<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: object,
  schema: TVocabulary & DependentSchemas<TVocabulary>,
  context: TContext,
): boolean {
  const { dependentSchemas } = schema;
  const { schemaConstraint } = context;
  let valid = true;

  for (const key of Object.keys(dependentSchemas)) {
    if ((value as any)[key] !== undefined) {
      const errorCount = context.errors.length;
      if (!schemaConstraint(value, dependentSchemas[key]!, context)) {
        fixKeywordLocations(context, errorCount, 'dependentSchemas', key);
        valid = false;
      }
    }
  }

  return valid;
}
