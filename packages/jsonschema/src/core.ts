export interface Dialect<TVocabulary, TContext> {
  constraint: Constraint<unknown, TVocabulary, TContext>;
  validate(
    value: unknown,
    schema: Schema<TVocabulary>,
    constraint: Constraint<unknown, Schema<TVocabulary>, TContext>,
  ): ValidationResult<TVocabulary>;
  traverse(schema: TVocabulary): Generator<TVocabulary>;
}

export type Constraint<T, TVocabulary, TContext> = (
  value: T,
  schema: TVocabulary,
  context: TContext,
) => boolean;

export type Schema<TVocabulary> = TVocabulary | boolean;

export type ValidationResult<TVocabulary> =
  | {
      valid: true;
      errors: ErrorReport<TVocabulary>[];
    }
  | { valid: false; errors: [] };

export interface ErrorReport<TVocabulary> {
  error: string;
  instanceLocation: string;
  keywordLocation: string;
  absoluteKeywordLocation: string;
  value: unknown;
  schema: Schema<TVocabulary>;
}

export interface CoreVocabulary<TVocabulary> {
  $anchor?: string;
  $comment?: string;
  $defs?: Record<string, Schema<TVocabulary>>;
  $dynamicAnchor?: string;
  $dynamicRef?: string;
  $id?: string;
  $ref?: string;
  $schema?: string;
  $vocabulary?: string;
}

export interface Type {
  type: PrimitiveType | PrimitiveType[];
}

export type PrimitiveType =
  | 'array'
  | 'boolean'
  | 'integer'
  | 'null'
  | 'number'
  | 'object'
  | 'string';

// biome-ignore format:
export type ParseType<T extends PrimitiveType | PrimitiveType[]> =
  T extends PrimitiveType[] ? ParseType<T[number]> :
  T extends 'array' ? unknown[] :
  T extends 'boolean' ? boolean :
  T extends 'null' ? null :
  T extends 'integer' | 'number' ? number :
  T extends 'object' ? object :
  T extends 'string' ? string :
  never;
