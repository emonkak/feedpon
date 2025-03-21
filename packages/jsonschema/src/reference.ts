import type { CoreVocabulary, Schema } from './core.ts';

export interface Reference<TVocabulary> {
  schema: Schema<TVocabulary>;
  scope: object;
  url: URL;
}

export interface CollectOptions {
  baseURL?: URL;
  scope?: object;
}

export class ReferenceCollector<
  TVocabulary extends CoreVocabulary<TVocabulary>,
> {
  private readonly _traverser: (schema: TVocabulary) => Generator<TVocabulary>;

  constructor(traverser: (schema: TVocabulary) => Generator<TVocabulary>) {
    this._traverser = traverser;
  }

  collect(
    schema: TVocabulary,
    { baseURL = new URL('file://'), scope = schema }: CollectOptions = {},
  ): Generator<Reference<TVocabulary>> {
    return collectReferences(schema, scope, baseURL, this._traverser);
  }
}

function* collectReferences<TVocabulary extends CoreVocabulary<TVocabulary>>(
  schema: TVocabulary,
  scope: object,
  url: URL,
  traverser: (schema: TVocabulary) => Generator<TVocabulary>,
): Generator<Reference<TVocabulary>> {
  if (schema.$id !== undefined) {
    scope = schema;
    url = new URL(schema.$id, url);
    yield {
      schema,
      scope,
      url,
    };
  }

  if (schema.$dynamicAnchor !== undefined) {
    const anchorURL = new URL('#' + schema.$dynamicAnchor, url);
    yield {
      schema,
      scope,
      url: anchorURL,
    };
  }

  if (schema.$anchor !== undefined) {
    const anchorURL = new URL('#' + schema.$anchor, url);
    yield {
      schema,
      scope,
      url: anchorURL,
    };
  }

  for (const subschema of traverser(schema)) {
    yield* collectReferences(subschema, scope, url, traverser);
  }
}
