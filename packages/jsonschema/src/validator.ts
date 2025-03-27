import {
  type HasErrorReports,
  type HasSchemaConstraint,
  fixAbsoluteKeywordLocations,
  fixKeywordLocations,
} from './context.ts';
import type {
  CoreVocabulary,
  Dialect,
  ErrorReport,
  Schema,
  ValidationResult,
} from './core.ts';
import { quote } from './helpers.ts';
import { isJSONPointerURL, resolveJSONPointerURL } from './pointer.ts';

export interface ValidationOptions<TVocabulary> {
  baseURL?: string;
  enableStaticReference?: boolean;
  preloadedReferences?:
    | PreloadedReference<TVocabulary>[]
    | IteratorObject<PreloadedReference<TVocabulary>>;
  documentRoot?: TVocabulary;
}

export interface PreloadedReference<TVocabulary> {
  schema: TVocabulary;
  url: string;
}

interface ValidationContext<TVocabulary, TContext>
  extends HasErrorReports<TVocabulary>,
    HasSchemaConstraint<TVocabulary, TContext> {}

interface AnchorResource<TVocabulary> {
  anchor: string;
  schema: TVocabulary;
}

interface ReferenceResource<TVocabulary> {
  schema: Schema<TVocabulary>;
  scope: TVocabulary;
  url: string;
}

interface StackFrame<TVocabulary> {
  scope: TVocabulary;
  url: string;
}

export class JSONSchemaValidator<
  TVocabulary extends CoreVocabulary<TVocabulary>,
  TContext extends ValidationContext<TVocabulary, TContext>,
> {
  private readonly _dialect: Dialect<TVocabulary, TContext>;

  constructor(dialect: Dialect<TVocabulary, TContext>) {
    this._dialect = dialect;
  }

  ensureValid(
    value: unknown,
    schema: Schema<TVocabulary>,
    options?: ValidationOptions<TVocabulary>,
  ): void {
    const { valid, errors } = this.validate(value, schema, options);
    if (!valid) {
      throw ValidationError.fromErrors(errors);
    }
  }

  validate(
    value: unknown,
    schema: Schema<TVocabulary>,
    {
      documentRoot,
      baseURL = 'file://',
      preloadedReferences = [],
      enableStaticReference = false,
    }: ValidationOptions<TVocabulary> = {},
  ): ValidationResult<TVocabulary> {
    const stackFrames: StackFrame<TVocabulary>[] = [];
    const enterStackFrame = (scope: TVocabulary): StackFrame<TVocabulary> => {
      if (scope.$id !== undefined) {
        const newFrame = {
          scope,
          url: new URL(
            scope.$id,
            stackFrames.at(-1)?.url ?? baseURL,
          ).toString(),
        };
        stackFrames.push(newFrame);
        return newFrame;
      } else if (stackFrames.length === 0) {
        const newFrame = {
          scope: documentRoot ?? scope,
          url: baseURL,
        };
        stackFrames.push(newFrame);
        return newFrame;
      } else {
        return stackFrames.at(-1)!;
      }
    };
    const leaveStackFrame = (): void => {
      stackFrames.pop();
    };
    const referenceResources = new Map<string, ReferenceResource<TVocabulary>>(
      preloadedReferences.map(({ schema, url }) => [
        url,
        { schema, scope: schema, url },
      ]),
    );

    if (enableStaticReference && typeof schema !== 'boolean') {
      for (const referencedResource of collectReferenceResources(
        this._dialect,
        schema,
        documentRoot ?? schema,
        baseURL,
      )) {
        referenceResources.set(referencedResource.url, referencedResource);
      }
    }

    return this._dialect.validate(value, schema, (value, schema, context) => {
      if (typeof schema === 'boolean') {
        if (!schema) {
          context.errors.push({
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

      const { $ref, $dynamicRef } = schema;
      const { errors, schemaConstraint } = context;
      const errorCount = errors.length;
      const stackDepth = stackFrames.length;
      const currentFrame = enterStackFrame(schema);
      let valid;

      if ($dynamicRef !== undefined) {
        const resource =
          resolvePointerReference(
            $dynamicRef,
            currentFrame.scope,
            currentFrame.url,
          ) ??
          resolveDynamicReference(
            $dynamicRef,
            currentFrame.url,
            stackFrames,
            referenceResources,
            this._dialect,
          ) ??
          resolveStaticReference(
            $dynamicRef,
            currentFrame.url,
            referenceResources,
          );
        if (resource === null) {
          throw new Error(
            `Dynamic reference ${quote($dynamicRef)} could not be resolved.`,
          );
        }
        if (resource.scope !== resource.schema) {
          enterStackFrame(resource.scope);
        }
        valid = schemaConstraint(value, resource.schema, context);
        if (!valid) {
          fixKeywordLocations(context, errorCount, '$dynamicRef');
          fixAbsoluteKeywordLocations(context, errorCount, resource.url);
        }
      } else if ($ref !== undefined) {
        const resource =
          resolvePointerReference($ref, currentFrame.scope, currentFrame.url) ??
          resolveStaticReference($ref, currentFrame.url, referenceResources);
        if (resource === null) {
          throw new Error(`Reference ${quote($ref)} could not be resolved.`);
        }
        if (resource.scope !== resource.schema) {
          enterStackFrame(resource.scope);
        }
        valid = schemaConstraint(value, resource.schema, context);
        if (!valid) {
          fixKeywordLocations(context, errorCount, '$ref');
          fixAbsoluteKeywordLocations(context, errorCount, resource.url);
        }
      } else {
        valid = this._dialect.constraint(value, schema, context);
        if (!valid) {
          fixAbsoluteKeywordLocations(context, errorCount, currentFrame.url);
        }
      }

      for (let i = stackFrames.length - stackDepth; i > 0; i--) {
        leaveStackFrame();
      }

      return valid;
    });
  }
}

export class ValidationError<TVocabulary> extends Error {
  private readonly _errors: ErrorReport<TVocabulary>[];

  static fromErrors<TVocabulary>(
    errors: ErrorReport<TVocabulary>[],
    options?: ErrorOptions,
  ): ValidationError<TVocabulary> {
    const groupedViolations = Map.groupBy(
      errors,
      (error) => error.instanceLocation,
    );
    const message =
      `Validation failed with ${errors.length} error(s) at ${groupedViolations.size} location(s):\n` +
      groupedViolations
        .entries()
        .map(
          ([location, errors]) =>
            `at "#${location}":\n` +
            errors.map((violation) => '  - ' + violation.error).join('\n'),
        )
        .toArray()
        .join('\n');

    return new ValidationError(message, errors, options);
  }

  private constructor(
    message: string,
    errors: ErrorReport<TVocabulary>[],
    options?: ErrorOptions,
  ) {
    super(message, options);
    this._errors = errors;
  }

  get errors(): ErrorReport<TVocabulary>[] {
    return this._errors;
  }
}

function* collectDynamicAnchors<
  TVocabulary extends CoreVocabulary<TVocabulary>,
  TContext,
>(
  dialect: Dialect<TVocabulary, TContext>,
  schema: TVocabulary,
): Generator<AnchorResource<TVocabulary>> {
  if (schema.$dynamicAnchor !== undefined) {
    yield {
      anchor: schema.$dynamicAnchor,
      schema,
    };
  }

  for (const subschema of dialect.traverse(schema)) {
    if (subschema.$id === undefined) {
      yield* collectDynamicAnchors(dialect, subschema);
    }
  }
}

function* collectReferenceResources<
  TVocabulary extends CoreVocabulary<TVocabulary>,
  TContext,
>(
  dialect: Dialect<TVocabulary, TContext>,
  schema: TVocabulary,
  documentRoot: TVocabulary,
  baseURL: string,
): Generator<ReferenceResource<TVocabulary>> {
  let scope = documentRoot;
  let url = baseURL;

  if (schema.$id !== undefined) {
    scope = schema;
    url = new URL(schema.$id, url).toString();
    yield {
      schema,
      scope,
      url,
    };
  }

  if (schema.$dynamicAnchor !== undefined) {
    yield {
      schema,
      scope,
      url: new URL('#' + schema.$dynamicAnchor, url).toString(),
    };
  }

  if (schema.$anchor !== undefined) {
    yield {
      schema,
      scope,
      url: new URL('#' + schema.$anchor, url).toString(),
    };
  }

  for (const subschema of dialect.traverse(schema)) {
    yield* collectReferenceResources(dialect, subschema, scope, url);
  }
}

function* collectStaticAnchors<
  TVocabulary extends CoreVocabulary<TVocabulary>,
  TContext,
>(
  dialect: Dialect<TVocabulary, TContext>,
  schema: TVocabulary,
): Generator<AnchorResource<TVocabulary>> {
  if (schema.$anchor !== undefined) {
    yield {
      anchor: schema.$anchor,
      schema,
    };
  }

  for (const subschema of dialect.traverse(schema)) {
    if (subschema.$id === undefined) {
      yield* collectStaticAnchors(dialect, subschema);
    }
  }
}

function resolveDynamicReference<
  TVocabulary extends CoreVocabulary<TVocabulary>,
  TContext,
>(
  ref: string,
  baseURL: string,
  stackFrames: StackFrame<TVocabulary>[],
  referenceResources: Map<string, ReferenceResource<TVocabulary>>,
  dialect: Dialect<TVocabulary, TContext>,
): ReferenceResource<TVocabulary> | null {
  const url = new URL(ref, baseURL);
  const expectedAnchor = url.hash.slice(1);
  let dynamicFrames: StackFrame<TVocabulary>[];
  let lexicalFrame: StackFrame<TVocabulary> | null;

  if (!ref.startsWith('#')) {
    const urlWithoutHash = url.href.slice(0, -url.hash.length);
    const reference = referenceResources.get(urlWithoutHash) ?? null;
    if (reference === null || typeof reference.schema === 'boolean') {
      return null;
    }
    dynamicFrames = stackFrames;
    lexicalFrame = reference as StackFrame<TVocabulary>;
  } else {
    dynamicFrames = stackFrames.slice(0, -1);
    lexicalFrame = stackFrames.at(-1) ?? null;
  }

  if (lexicalFrame !== null) {
    for (const { anchor, schema } of collectStaticAnchors(
      dialect,
      lexicalFrame.scope,
    )) {
      if (anchor === expectedAnchor) {
        return {
          schema,
          scope: lexicalFrame.scope,
          url: url.toString(),
        };
      }
    }
  }

  for (let i = dynamicFrames.length - 1; i >= 0; i--) {
    const dynamicFrame = dynamicFrames[i]!;
    for (const { anchor, schema } of collectDynamicAnchors(
      dialect,
      dynamicFrame.scope,
    )) {
      if (anchor === expectedAnchor) {
        return {
          schema,
          scope: dynamicFrame.scope,
          url: url.toString(),
        };
      }
    }
  }

  if (lexicalFrame !== null) {
    for (const { anchor, schema } of collectDynamicAnchors(
      dialect,
      lexicalFrame.scope,
    )) {
      if (anchor === expectedAnchor) {
        return {
          schema,
          scope: lexicalFrame.scope,
          url: url.toString(),
        };
      }
    }
  }

  return null;
}

function resolvePointerReference<
  TVocabulary extends CoreVocabulary<TVocabulary>,
>(
  ref: string,
  scope: TVocabulary,
  url: string,
): ReferenceResource<TVocabulary> | null {
  if (isJSONPointerURL(ref)) {
    const schema = resolveJSONPointerURL(ref, scope);
    if (schema === null) {
      return null;
    }
    return {
      schema: schema as Schema<TVocabulary>,
      scope,
      url,
    };
  }

  return null;
}

function resolveStaticReference<
  TVocabulary extends CoreVocabulary<TVocabulary>,
>(
  ref: string,
  baseUrl: string,
  referenceResources: Map<string, ReferenceResource<TVocabulary>>,
): ReferenceResource<TVocabulary> | null {
  const url = new URL(ref, baseUrl);

  if (isJSONPointerURL(url.hash)) {
    const urlWithoutHash = url.href.slice(0, -url.hash.length);
    const reference = referenceResources.get(urlWithoutHash) ?? null;
    if (reference === null) {
      return null;
    }
    const schema = resolveJSONPointerURL(url.hash, reference.schema);
    if (schema === null) {
      return null;
    }
    return {
      schema: schema as Schema<TVocabulary>,
      scope: reference.scope,
      url: url.toString(),
    };
  }

  return referenceResources.get(url.href) ?? null;
}
