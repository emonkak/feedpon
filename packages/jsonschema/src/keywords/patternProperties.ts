import {
  type HasErrorReports,
  type HasEvaluatedLocations,
  type HasSchemaConstraint,
  fixInstanceLocations,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface PatternProperties<TVocabulary> {
  patternProperties: Record<string, Schema<TVocabulary>>;
}

export function patternProperties<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasEvaluatedLocations &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: object,
  schema: TVocabulary & PatternProperties<TVocabulary>,
  context: TContext,
): boolean {
  const { patternProperties } = schema;
  const { evaluatedLocations, schemaConstraint } = context;
  const keys = Object.keys(value);
  let valid = true;

  evaluatedLocations.properties ??= new Set();

  for (const pattern of Object.keys(patternProperties)) {
    const regexp = new RegExp(pattern);

    for (const key of keys) {
      if (!regexp.test(key)) {
        continue;
      }

      const subContext = {
        ...context,
        evaluatedLocations: { index: -1, properties: null },
      };
      const errorCount = context.errorReports.length;

      if (
        !schemaConstraint(
          (value as any)[key],
          patternProperties[pattern]!,
          subContext,
        )
      ) {
        fixInstanceLocations(context, errorCount, key);
        fixKeywordLocations(context, errorCount, 'patternProperties', pattern);
        valid = false;
      }

      evaluatedLocations.properties.add(key);
    }
  }

  return valid;
}
