import {
  type HasErrorReports,
  type HasEvaluatedLocations,
  type HasSchemaConstraint,
  fixInstanceLocations,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface AdditionalProperties<TVocabulary> {
  additionalProperties: Schema<TVocabulary>;
}

export function additionalProperties<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasEvaluatedLocations &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: object,
  schema: TVocabulary & AdditionalProperties<TVocabulary>,
  context: TContext,
): boolean {
  const { additionalProperties } = schema;
  const { evaluatedLocations, schemaConstraint } = context;
  let valid = true;

  evaluatedLocations.properties ??= new Set();

  for (const key of Object.keys(value)) {
    if (evaluatedLocations.properties.has(key)) {
      continue;
    }

    const subContext = {
      ...context,
      evaluatedLocations: { index: -1, properties: null },
    };
    const errorCount = context.errorReports.length;

    if (
      !schemaConstraint((value as any)[key], additionalProperties, subContext)
    ) {
      fixInstanceLocations(context, errorCount, key);
      fixKeywordLocations(context, errorCount, 'additionalProperties');
      valid = false;
    }

    evaluatedLocations.properties.add(key);
  }

  return valid;
}
