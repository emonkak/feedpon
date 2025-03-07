import type { AllOf, AnyOf, Get, Only, OrElse, Split } from './helpers.ts';

export type Schema = boolean | SchemaObject;

export type SchemaObject = Partial<
  CoreSchema &
    MetadataSchema &
    PrimitiveTypeSchema &
    ArraySchema &
    NumericSchema &
    ObjectSchema &
    StringSchema &
    FormatSchema &
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
  $dynamicRef?: string;
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

export interface PrimitiveTypeSchema {
  type: PrimitiveType | PrimitiveType[];
}

export interface ArraySchema {
  contains?: Schema;
  items?: Schema;
  maxContains?: number;
  maxItems?: number;
  minContains?: number;
  minItems?: number;
  prefixItems?: Schema[];
  unevaluatedItems?: Schema;
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
  propertyNames?: Schema;
  required?: string[];
  unevaluatedProperties?: boolean;
}

export interface StringSchema {
  contentEncoding?: string;
  contentMediaType?: string;
  contentSchema?: Schema;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface FormatSchema {
  format?: string;
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

export type TryParseSchema<T, TDocumentRoot> = T extends Schema
  ? ParseSchema<T, TDocumentRoot>
  : never;

export type ParseSchema<T extends Schema, TDocumentRoot> = T extends true
  ? unknown
  : T extends false
    ? never
    : (T extends PrimitiveTypeSchema
        ? ParsePrimitiveType<
            T['type'] extends any[]
              ? AnyOf<T['type']>
              : Extract<T['type'], PrimitiveType>
          >
        : unknown) &
        (T extends ArraySchema &
          Required<Only<ArraySchema, 'items' | 'prefixItems'>>
          ? ParseItems<
              OrElse<T['items'], false>,
              OrElse<T['prefixItems'], []>,
              TDocumentRoot
            >
          : unknown) &
        (T extends ObjectSchema &
          Required<Only<ObjectSchema, 'properties' | 'additionalProperties'>>
          ? ParseProperties<
              OrElse<T['properties'], {}>,
              OrElse<T['additionalProperties'], false>,
              OrElse<T['required'], []>,
              TDocumentRoot
            >
          : unknown) &
        (T extends ConstSchema ? T['const'] : unknown) &
        (T extends EnumSchema ? AnyOf<T['enum']> : unknown) &
        (T extends AllOfSchema
          ? AllOf<ParseCombination<T['allOf'], TDocumentRoot>>
          : unknown) &
        (T extends AnyOfSchema
          ? AnyOf<ParseCombination<T['anyOf'], TDocumentRoot>>
          : unknown) &
        (T extends OneOfSchema
          ? AnyOf<ParseCombination<T['oneOf'], TDocumentRoot>>
          : unknown) &
        (T extends { $ref: string }
          ? ParseReference<T['$ref'], TDocumentRoot>
          : unknown);

export type LookupReference<T extends string, TDocumentRoot> = T extends '#'
  ? TDocumentRoot
  : T extends `#/${infer Path}`
    ? Get<TDocumentRoot, Split<Path, '/'>>
    : never;

type ParseCombination<T extends Schema[], TDocumentRoot> = T extends [
  infer Head extends Schema,
  infer Tail extends Schema[],
]
  ? [ParseSchema<Head, TDocumentRoot>, ...ParseCombination<Tail, TDocumentRoot>]
  : [];

type ParseItems<
  TItems extends Schema,
  TPrefixItems extends Schema[],
  TDocumentRoot,
> = TPrefixItems extends [
  infer Head extends Schema,
  ...infer Tail extends Schema[],
]
  ? [
      ParseSchema<Head, TDocumentRoot>,
      ...ParseItems<TItems, Tail, TDocumentRoot>,
    ]
  : TItems extends false
    ? []
    : ParseSchema<TItems, TDocumentRoot>[];

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
  TDocumentRoot,
> = {
  [K in Extract<keyof TProperties, AnyOf<TRequired>>]: ParseSchema<
    TProperties[K],
    TDocumentRoot
  >;
} & {
  [K in Exclude<keyof TProperties, AnyOf<TRequired>>]?: ParseSchema<
    TProperties[K],
    TDocumentRoot
  > &
    (TAdditionalProperties extends false
      ? {}
      : {
          [key: string]: ParseSchema<TAdditionalProperties, TDocumentRoot>;
        });
};

type ParseReference<T extends string, TDocumentRoot> = TryParseSchema<
  LookupReference<T, TDocumentRoot>,
  TDocumentRoot
>;

const REF_PATTERN = /^#\/?/;

export function lookupReference(ref: string, documentRoot: object): unknown {
  if (!REF_PATTERN.test(ref)) {
    throw new Error('Invalid reference: ' + JSON.stringify(ref));
  }

  if (ref === '#') {
    return documentRoot;
  }

  let reference = documentRoot as any;
  const components = ref.slice(2).split('/');

  for (let i = 0, l = components.length; i < l; i++) {
    const component = components[i]!;
    if (!(component in reference)) {
      throw new Error('Unresolved reference: ' + JSON.stringify(ref));
    }
    reference = reference[component];
  }

  return reference;
}
