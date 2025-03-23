import {
  type HasErrorReports,
  type HasEvaluatedLocations,
  type HasSchemaConstraint,
  fixInstanceLocations,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface UnevaluatedProperties<TVocabulary> {
  unevaluatedProperties: Schema<TVocabulary>;
}

export function unevaluatedProperties<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasEvaluatedLocations &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: object,
  schema: TVocabulary & UnevaluatedProperties<TVocabulary>,
  context: TContext,
): boolean {
  const { unevaluatedProperties } = schema;
  const { evaluatedLocations, schemaConstraint } = context;
  let valid = true;

  evaluatedLocations.properties ??= new Set();

  for (const key of Object.keys(value)) {
    if (evaluatedLocations.properties.has(key)) {
      continue;
    }

    const subContext = { ...context, evaluatedLocations: null };
    const errorCount = context.errors.length;

    if (
      !schemaConstraint((value as any)[key]!, unevaluatedProperties, subContext)
    ) {
      fixInstanceLocations(context, errorCount, key);
      fixKeywordLocations(context, errorCount, 'unevaluatedProperties');
      valid = false;
    }

    evaluatedLocations.properties.add(key);
  }

  return valid;
}
