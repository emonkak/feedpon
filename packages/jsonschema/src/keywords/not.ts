import type { HasErrorReports, HasSchemaConstraint } from '../context.ts';
import type { Schema } from '../core.ts';

export interface Not<TVocabulary> {
  not: Schema<TVocabulary>;
}

export function not<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: unknown,
  schema: TVocabulary & Not<TVocabulary>,
  context: TContext,
): boolean {
  const { not } = schema;
  const { schemaConstraint } = context;
  const subContext = { ...context, errorReports: [] };

  if (schemaConstraint(value, not, subContext)) {
    context.errorReports.push({
      error: 'Value matches a forbidden schema.',
      instanceLocation: '',
      keywordLocation: '/not',
      absoluteKeywordLocation: '',
      value,
      schema,
    });
    return false;
  }

  return true;
}
