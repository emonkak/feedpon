import {
  fixInstanceLocations,
  fixKeywordLocations,
  type HasErrorReports,
  type HasEvaluatedLocations,
  type HasSchemaConstraint,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface Properties<TVocabulary> {
  properties: Record<string, Schema<TVocabulary>>;
}

export function properties<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasEvaluatedLocations &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: object,
  schema: TVocabulary & Properties<TVocabulary>,
  context: TContext,
): boolean {
  const { properties } = schema;
  const { evaluatedLocations, schemaConstraint } = context;
  let valid = true;

  evaluatedLocations.properties ??= new Set();

  for (const key of Object.keys(properties)) {
    if (!Object.hasOwn(value, key)) {
      continue;
    }

    const subContext = {
      ...context,
      evaluatedLocations: { index: -1, properties: null },
    };
    const errorCount = context.errors.length;

    if (!schemaConstraint((value as any)[key], properties[key]!, subContext)) {
      fixInstanceLocations(context, errorCount, key);
      fixKeywordLocations(context, errorCount, 'properties', key);
      valid = false;
    }

    evaluatedLocations.properties.add(key);
  }

  return valid;
}
