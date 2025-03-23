import type {
  HasErrorReports,
  HasEvaluatedLocations,
  HasSchemaConstraint,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface Contains<TVocabulary> {
  contains: Schema<TVocabulary>;
  minContains?: number;
  maxContains?: number;
}

export function contains<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasEvaluatedLocations &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: unknown[],
  schema: TVocabulary & Contains<TVocabulary>,
  context: TContext,
): boolean {
  const { contains, minContains, maxContains } = schema;
  const { evaluatedLocations, schemaConstraint } = context;
  let matchCount = 0;
  let valid = true;

  for (let i = 0, l = value.length; i < l; i++) {
    const subContext = {
      ...context,
      evaluatedLocations: { index: -1, properties: null },
      errors: [],
    };
    if (schemaConstraint(value[i], contains, subContext)) {
      matchCount++;
    }
  }

  if (minContains !== undefined) {
    if (matchCount < minContains) {
      context.errors.push({
        error: `Array must contain at least ${minContains} items matching the "contains" schema, but found ${matchCount}.`,
        instanceLocation: '',
        keywordLocation: '/minContains',
        absoluteKeywordLocation: '',
        value,
        schema,
      });
      valid = false;
    }
  } else if (matchCount === 0) {
    context.errors.push({
      error:
        'Array must contain at least one item matching the "contains" schema.',
      instanceLocation: '',
      keywordLocation: '/contains',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    valid = false;
  }

  if (maxContains !== undefined && matchCount > maxContains) {
    context.errors.push({
      error: `Array must contain at most ${maxContains} items matching the "contains" schema, but found ${matchCount}.`,
      instanceLocation: '',
      keywordLocation: '/maxContains',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    valid = false;
  }

  evaluatedLocations.index = value.length - 1;

  return valid;
}
