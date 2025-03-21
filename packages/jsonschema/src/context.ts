import type { Constraint, ErrorReport, Schema } from './core.ts';
import { escapeJSONPointerComponent } from './pointer.ts';

export interface EvaluatedLocations {
  index: number;
  properties: Set<string> | null;
}

export interface HasErrorReports<TVocabulary> {
  errorReports: ErrorReport<TVocabulary>[];
}

export interface HasEvaluatedLocations {
  evaluatedLocations: EvaluatedLocations;
}

export interface HasSchemaConstraint<TVocabulary, TContext> {
  schemaConstraint: Constraint<unknown, Schema<TVocabulary>, TContext>;
}

export interface HasVocabularyConstraint<TVocabulary, TContext> {
  vocabularyConstraint: Constraint<unknown, TVocabulary, TContext>;
}

export function fixInstanceLocations<TVocabulary>(
  context: HasErrorReports<TVocabulary>,
  position: number,
  key: string,
): void {
  const { errorReports } = context;
  const prefix = '/' + escapeJSONPointerComponent(key);
  for (let i = position, l = errorReports.length; i < l; i++) {
    const errorReport = errorReports[i]!;
    errorReport.instanceLocation = prefix + errorReport.instanceLocation;
  }
}

export function fixKeywordLocations<TVocabulary>(
  context: HasErrorReports<TVocabulary>,
  position: number,
  ...keys: string[]
): void {
  const { errorReports } = context;
  const prefix = '/' + keys.map(escapeJSONPointerComponent).join('/');
  for (let i = position, l = errorReports.length; i < l; i++) {
    const errorReport = errorReports[i]!;
    errorReport.keywordLocation = prefix + errorReport.keywordLocation;
  }
}

export function fixAbsoluteKeywordLocation<TVocabulary>(
  context: HasErrorReports<TVocabulary>,
  position: number,
  url: URL,
): void {
  const { errorReports } = context;
  const urlString = url.toString();
  for (let i = position, l = errorReports.length; i < l; i++) {
    const errorReport = errorReports[i]!;
    errorReport.absoluteKeywordLocation = urlString;
  }
}
