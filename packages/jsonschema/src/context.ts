import type { Constraint, ErrorReport, Schema } from './core.ts';
import { escapeJSONPointerComponent } from './pointer.ts';

export interface EvaluatedLocations {
  index: number;
  properties: Set<string> | null;
}

export interface HasErrorReports<TVocabulary> {
  errors: ErrorReport<TVocabulary>[];
}

export interface HasEvaluatedLocations {
  evaluatedLocations: EvaluatedLocations;
}

export interface HasSchemaConstraint<TVocabulary, TContext> {
  schemaConstraint: Constraint<unknown, Schema<TVocabulary>, TContext>;
}

export function fixInstanceLocations<TVocabulary>(
  context: HasErrorReports<TVocabulary>,
  position: number,
  key: string,
): void {
  const { errors } = context;
  const prefix = '/' + escapeJSONPointerComponent(key);
  for (let i = position, l = errors.length; i < l; i++) {
    const error = errors[i]!;
    error.instanceLocation = prefix + error.instanceLocation;
  }
}

export function fixKeywordLocations<TVocabulary>(
  context: HasErrorReports<TVocabulary>,
  position: number,
  ...keys: string[]
): void {
  const { errors } = context;
  const prefix = '/' + keys.map(escapeJSONPointerComponent).join('/');
  for (let i = position, l = errors.length; i < l; i++) {
    const error = errors[i]!;
    error.keywordLocation = prefix + error.keywordLocation;
  }
}

export function fixAbsoluteKeywordLocation<TVocabulary>(
  context: HasErrorReports<TVocabulary>,
  position: number,
  url: string,
): void {
  const { errors } = context;
  for (let i = position, l = errors.length; i < l; i++) {
    const error = errors[i]!;
    error.absoluteKeywordLocation = url;
  }
}
