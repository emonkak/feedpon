import {
  type HasErrorReports,
  type HasVocabularyConstraint,
  fixAbsoluteKeywordLocation,
  fixKeywordLocations,
} from './context.ts';
import type {
  CoreVocabulary,
  ErrorReport,
  Schema,
  ValidationResult,
  Validator,
} from './core.ts';
import { quote } from './helpers.ts';
import { isJSONPointerURL, resolveJSONPointerURL } from './pointer.ts';
import type { Reference } from './reference.ts';

export interface ValidationOptions<TVocabulary> {
  baseURL?: URL;
  references?:
    | Reference<TVocabulary>[]
    | IteratorObject<Reference<TVocabulary>>;
  scope?: object;
}

interface ValidationContext<TVocabulary, TContext>
  extends HasErrorReports<TVocabulary>,
    HasVocabularyConstraint<TVocabulary, TContext> {}

interface StackFrame<TVocabulary> {
  schema: TVocabulary;
  scope: object;
  url: URL;
}

export class ValidationEngine<
  TVocabulary extends CoreVocabulary<TVocabulary>,
  TContext extends ValidationContext<TVocabulary, TContext>,
> {
  private readonly _validator: Validator<TVocabulary, TContext>;

  constructor(validator: Validator<TVocabulary, TContext>) {
    this._validator = validator;
  }

  ensureValid(
    value: unknown,
    schema: Schema<TVocabulary>,
    options?: ValidationOptions<TVocabulary>,
  ): void {
    const { valid, errors } = this.validate(value, schema, options);
    if (!valid) {
      throw ValidationError.fromErrorReports(errors);
    }
  }

  validate(
    value: unknown,
    schema: Schema<TVocabulary>,
    {
      baseURL = new URL('file://'),
      references = [],
      scope: rootScope = typeof schema === 'object' ? schema : {},
    }: ValidationOptions<TVocabulary> = {},
  ): ValidationResult<TVocabulary> {
    const validator = this._validator;
    const stackFrames: StackFrame<TVocabulary>[] = [];
    const referenceRegistry = new Map(
      references.map((reference) => [reference.url.href, reference]),
    );
    let currentScope = rootScope;
    const enterFrame = <T>(
      newFrame: StackFrame<TVocabulary>,
      newScope: object,
      callback: () => T,
    ): T => {
      stackFrames.push(newFrame);
      const oldScope = currentScope;
      currentScope = newScope;
      try {
        return callback();
      } finally {
        currentScope = oldScope;
        stackFrames.pop();
      }
    };
    return validator(
      value,
      schema,
      function schemaConstraint(value, schema, context): boolean {
        if (typeof schema === 'boolean') {
          if (!schema) {
            context.errorReports.push({
              error: 'No value is allowed.',
              instanceLocation: '',
              keywordLocation: '',
              absoluteKeywordLocation: '',
              schema,
              value,
            });
          }
          return schema;
        }

        const { $id, $ref, $dynamicRef } = schema;
        const currentFrame =
          $id !== undefined
            ? {
                schema,
                scope: schema,
                url: new URL($id, stackFrames.at(-1)?.url ?? baseURL),
              }
            : {
                schema,
                scope: currentScope,
                url: stackFrames.at(-1)?.url ?? baseURL,
              };

        if ($dynamicRef !== undefined) {
          const reference =
            resolvePointerRef($dynamicRef, currentFrame) ??
            resolveDynamicRef(
              $dynamicRef,
              currentFrame,
              stackFrames,
              referenceRegistry,
            ) ??
            resolveStaticRef($dynamicRef, currentFrame, referenceRegistry);
          if (reference === null) {
            throw new Error(
              `Dynamic reference ${quote($dynamicRef)} could not be resolved.`,
            );
          }
          return enterFrame(currentFrame, reference.scope, () => {
            const errorCount = context.errorReports.length;
            if (!schemaConstraint(value, reference.schema, context)) {
              fixKeywordLocations(context, errorCount, '$dynamicRef');
              fixAbsoluteKeywordLocation(context, errorCount, reference.url);
              return false;
            }
            return true;
          });
        }

        if ($ref !== undefined) {
          const reference =
            resolvePointerRef($ref, currentFrame) ??
            resolveStaticRef($ref, currentFrame, referenceRegistry);
          if (reference === null) {
            throw new Error(`Reference ${quote($ref)} could not be resolved.`);
          }
          return enterFrame(currentFrame, reference.scope, () => {
            const errorCount = context.errorReports.length;
            if (!schemaConstraint(value, reference.schema, context)) {
              fixKeywordLocations(context, errorCount, '$ref');
              fixAbsoluteKeywordLocation(context, errorCount, reference.url);
              return false;
            }
            return true;
          });
        }

        return enterFrame(currentFrame, currentFrame.scope, () => {
          const { vocabularyConstraint } = context;
          const errorCount = context.errorReports.length;
          if (!vocabularyConstraint(value, schema, context)) {
            if (schema.$id !== undefined) {
              fixAbsoluteKeywordLocation(context, errorCount, currentFrame.url);
            }
            return false;
          }
          return true;
        });
      },
    );
  }
}

export class ValidationError<TVocabulary> extends Error {
  private readonly _errorReports: ErrorReport<TVocabulary>[];

  static fromErrorReports<TVocabulary>(
    errorReports: ErrorReport<TVocabulary>[],
    options?: ErrorOptions,
  ): ValidationError<TVocabulary> {
    const groupedViolations = Map.groupBy(
      errorReports,
      (errorReport) => errorReport.instanceLocation,
    );
    const message =
      `Validation failed with ${errorReports.length} error(s) at ${groupedViolations.size} location(s):\n` +
      groupedViolations
        .entries()
        .map(
          ([location, errors]) =>
            `at "#${location}":\n` +
            errors.map((violation) => '  - ' + violation.error).join('\n'),
        )
        .toArray()
        .join('\n');

    return new ValidationError(message, errorReports, options);
  }

  constructor(
    message: string,
    errorReports: ErrorReport<TVocabulary>[],
    options?: ErrorOptions,
  ) {
    super(message, options);
    this._errorReports = errorReports;
  }

  get errorReports(): ErrorReport<TVocabulary>[] {
    return this._errorReports;
  }
}

function resolvePointerRef<TVocabulary extends CoreVocabulary<TVocabulary>>(
  ref: string,
  topFrame: StackFrame<TVocabulary>,
): Reference<TVocabulary> | null {
  if (isJSONPointerURL(ref)) {
    const schema = resolveJSONPointerURL(topFrame.scope, ref);
    if (schema === null) {
      return null;
    }
    return {
      schema: schema as Schema<TVocabulary>,
      scope: topFrame.scope,
      url: new URL(ref, topFrame.url),
    };
  }

  return null;
}

function resolveStaticRef<TVocabulary extends CoreVocabulary<TVocabulary>>(
  ref: string,
  topFrame: StackFrame<TVocabulary>,
  referenceRegistry: Map<string, Reference<TVocabulary>>,
): Reference<TVocabulary> | null {
  const refURL = new URL(ref, topFrame.url);

  if (isJSONPointerURL(refURL.hash)) {
    const urlWithoutHash = refURL.href.slice(0, -refURL.hash.length);
    const reference = referenceRegistry.get(urlWithoutHash) ?? null;
    if (reference === null) {
      return null;
    }
    const schema = resolveJSONPointerURL(reference.schema, refURL.hash);
    if (schema === null) {
      return null;
    }
    return {
      schema: schema as Schema<TVocabulary>,
      scope: reference.scope,
      url: refURL,
    };
  }

  return referenceRegistry.get(refURL.href) ?? null;
}

function resolveDynamicRef<TVocabulary extends CoreVocabulary<TVocabulary>>(
  ref: string,
  topFrame: StackFrame<TVocabulary>,
  stackFrames: StackFrame<TVocabulary>[],
  referenceRegistry: Map<string, Reference<TVocabulary>>,
): Reference<TVocabulary> | null {
  const refURL = new URL(ref, topFrame.url);
  const refHash = refURL.hash.slice(1);
  let pendingFrames;

  if (!ref.startsWith('#')) {
    const urlWithoutHash = refURL.href.slice(0, -refURL.hash.length);
    const reference = referenceRegistry.get(urlWithoutHash) ?? null;
    if (reference === null || typeof reference.schema === 'boolean') {
      return null;
    }
    pendingFrames = [
      reference as StackFrame<TVocabulary>,
      topFrame,
      ...stackFrames,
    ];
  } else {
    pendingFrames = [topFrame, ...stackFrames];
  }

  let currentFrame: StackFrame<TVocabulary> | undefined;

  while ((currentFrame = pendingFrames.pop()) !== undefined) {
    const { schema, scope, url } = currentFrame;

    if (schema.$dynamicAnchor !== undefined) {
      if (refHash === schema.$dynamicAnchor) {
        return currentFrame;
      }
    }

    if (schema.$anchor !== undefined) {
      if (refHash === schema.$anchor) {
        return currentFrame;
      }
    }

    if (schema.$defs !== undefined) {
      for (const def of Object.values(schema.$defs)) {
        if (typeof def === 'boolean') {
          continue;
        }
        const pendingFrame =
          def.$id !== undefined
            ? { schema: def, url: new URL(def.$id, url), scope: def }
            : { schema: def, url, scope };
        pendingFrames.push(pendingFrame);
      }
    }

    if (
      schema !== scope &&
      (schema.$ref !== undefined || schema.$dynamicRef !== undefined)
    ) {
      pendingFrames.push({
        schema: scope as TVocabulary,
        scope,
        url,
      });
    }
  }

  return null;
}
