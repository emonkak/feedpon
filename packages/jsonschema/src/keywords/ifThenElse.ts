import {
  type HasErrorReports,
  type HasSchemaConstraint,
  fixKeywordLocations,
} from '../context.ts';
import type { Schema } from '../core.ts';

export interface IfThenElse<TVocabulary> {
  if: Schema<TVocabulary>;
  then?: Schema<TVocabulary>;
  else?: Schema<TVocabulary>;
}

export function ifThenElse<
  TVocabulary,
  TContext extends HasErrorReports<TVocabulary> &
    HasSchemaConstraint<TVocabulary, TContext>,
>(
  value: unknown,
  schema: TVocabulary & IfThenElse<TVocabulary>,
  context: TContext,
): boolean {
  const {
    if: ifSchema,
    then: thenSchema = true,
    else: elseSchema = true,
  } = schema;
  const { schemaConstraint } = context;
  const errorCount = context.errorReports.length;
  const subContext = { ...context, errorReports: [] };

  if (schemaConstraint(value, ifSchema, subContext)) {
    if (!schemaConstraint(value, thenSchema, context)) {
      fixKeywordLocations(context, errorCount, 'then');
      return false;
    }
  } else {
    if (!schemaConstraint(value, elseSchema, context)) {
      fixKeywordLocations(context, errorCount, 'else');
      return false;
    }
  }

  return true;
}
