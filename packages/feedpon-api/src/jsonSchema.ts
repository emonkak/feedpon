export type Schema = boolean | SchemaObject;

// biome-ignore format:
export type SchemaObject = Partial<
  CoreSchema &
  MetadataSchema &
  (SingleTypeSchema | UnionTypeSchema) &
  ArraySchema &
  NumericSchema &
  ObjectSchema &
  StringSchema &
  ConstSchema &
  EnumSchema &
  AllOfSchema &
  AnyOfSchema &
  OneOfSchema &
  IfSchema &
  NotSchema
>;

export interface CoreSchema {
  $anchor?: string;
  $comment?: string;
  $defs?: Record<string, Schema>;
  $dynamicAnchor?: string;
  $id?: string;
  $ref?: string;
  $schema?: string;
  $vocabulary?: Record<string, boolean>;
}

export interface MetadataSchema {
  default?: unknown;
  deprecated?: boolean;
  description?: string;
  examples?: unknown[];
  readOnly?: boolean;
  title?: string;
  writeOnly?: boolean;
}

export type PrimitiveType =
  | 'array'
  | 'boolean'
  | 'null'
  | 'integer'
  | 'number'
  | 'object'
  | 'string';

export interface SingleTypeSchema {
  type: PrimitiveType;
}

export interface UnionTypeSchema {
  type: PrimitiveType[];
}

export interface ArraySchema {
  contains?: Schema;
  items?: Schema;
  maxContains?: number;
  maxItems?: number;
  minContains?: number;
  minItems?: number;
  prefixItems?: Schema[];
  unevaluatedItems?: boolean;
  uniqueItems?: boolean;
}

export interface NumericSchema {
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  minimum?: number;
  multipleOf?: number;
}

export interface ObjectSchema {
  additionalProperties?: Schema;
  dependencies?: Record<string, string[]>;
  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, Schema>;
  maxProperties?: number;
  minProperties?: number;
  patternProperties?: Record<string, Schema>;
  properties?: Record<string, Schema>;
  propertyNames?: Record<string, string>;
  required?: string[];
  unevaluatedProperties?: boolean;
}

export interface StringSchema {
  contentEncoding?: string;
  contentMediaType?: string;
  contentSchema?: Schema;
  format?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface ConstSchema {
  const: unknown;
}

export interface EnumSchema {
  enum: unknown[];
}

export interface AllOfSchema {
  allOf: Schema[];
}

export interface AnyOfSchema {
  anyOf: Schema[];
}

export interface OneOfSchema {
  oneOf: Schema[];
}

export interface IfSchema {
  if: Schema;
  then?: Schema;
  else?: Schema;
}

export interface NotSchema {
  not: Schema;
}

export type TryParseSchema<T, TReferences> = T extends Schema
  ? ParseSchema<T, TReferences>
  : unknown;

// biome-ignore format:
export type ParseSchema<T extends Schema, TReferences> =
  T extends true ? unknown :
  T extends false ? never :
  (T extends SingleTypeSchema ? ParsePrimitiveType<T['type']> : unknown) &
  (T extends UnionTypeSchema ? ParsePrimitiveType<AnyOf<T['type']>> : unknown) &
  (T extends ArraySchema & Required<Only<ArraySchema, 'items' | 'prefixItems'>>
    ? ParseItems<
        OrElse<T['items'], false>,
        OrElse<T['prefixItems'], []>,
        TReferences
      >
    : unknown) &
  (T extends ObjectSchema &
    Required<Only<ObjectSchema, 'properties' | 'additionalProperties'>>
    ? ParseProperties<
        OrElse<T['properties'], {}>,
        OrElse<T['additionalProperties'], false>,
        OrElse<T['required'], []>,
        TReferences
      >
    : unknown) &
  (T extends ConstSchema ? T['const'] : unknown) &
  (T extends EnumSchema ? AnyOf<T['enum']> : unknown) &
  (T extends AllOfSchema
    ? AllOf<ParseCombination<T['allOf'], TReferences>>
    : unknown) &
  (T extends AnyOfSchema
    ? AnyOf<ParseCombination<T['anyOf'], TReferences>>
    : unknown) &
  (T extends OneOfSchema
    ? AnyOf<ParseCombination<T['oneOf'], TReferences>>
    : unknown) &
  (T extends Required<Pick<CoreSchema, '$ref'>>
    ? ParseReference<T['$ref'], TReferences>
    : unknown);

type ParseCombination<T extends Schema[], TReferences> = T extends [
  infer Head extends Schema,
  infer Tail extends Schema[],
]
  ? [ParseSchema<Head, TReferences>, ...ParseCombination<Tail, TReferences>]
  : [];

type ParseItems<
  TItems extends Schema,
  TPrefixItems extends Schema[],
  TReferences,
> = TPrefixItems extends [
  infer Head extends Schema,
  ...infer Tail extends Schema[],
]
  ? [ParseSchema<Head, TReferences>, ...ParseItems<TItems, Tail, TReferences>]
  : TItems extends false
    ? []
    : ParseSchema<TItems, TReferences>[];

// biome-ignore format:
type ParsePrimitiveType<T extends PrimitiveType> =
  T extends 'array' ? unknown[] :
  T extends 'boolean' ? boolean :
  T extends 'null' ? null :
  T extends 'integer' | 'number' ? number :
  T extends 'object' ? object :
  T extends 'string' ? string :
  never;

type ParseProperties<
  TProperties extends Record<string, Schema>,
  TAdditionalProperties extends Schema,
  TRequired extends string[],
  TReferences,
> = {
  [K in Extract<keyof TProperties, AnyOf<TRequired>>]: ParseSchema<
    TProperties[K],
    TReferences
  >;
} & {
  [K in Exclude<keyof TProperties, AnyOf<TRequired>>]?: ParseSchema<
    TProperties[K],
    TReferences
  > &
    (TAdditionalProperties extends false
      ? {}
      : {
          [key: string]: ParseSchema<TAdditionalProperties, TReferences>;
        });
};

type ParseReference<TPath extends string, TReferences> = TryParseSchema<
  GetReference<TPath, TReferences>,
  TReferences
>;

export type GetReference<
  TPath extends string,
  TReferences,
> = TPath extends `#/${infer Path}`
  ? Get<TReferences, Split<Path, '/'>>
  : never;

type AllOf<T extends any[]> = T extends []
  ? {}
  : T extends [infer Head, ...infer Tail]
    ? Head & AllOf<Tail>
    : never;

type AnyOf<T extends any[]> = {
  [K in keyof T]: T[K];
}[number];

type Get<T, TPath extends string[]> = TPath extends [
  infer Head extends keyof T,
  ...infer Tail extends string[],
]
  ? Get<T[Head], Tail>
  : T;

type Only<T, K extends keyof T> = { [K1 in K]: { [K2 in K1]-?: T[K2] } }[K];

type OrElse<T, U> = T extends {} ? T : U;

type Split<
  T extends string,
  TSeparator extends string,
> = T extends `${infer Head}${TSeparator}${infer Tail}`
  ? [Head, ...Split<Tail, TSeparator>]
  : T extends ''
    ? []
    : [T];
