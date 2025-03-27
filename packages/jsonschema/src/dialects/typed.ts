import type { ParseType, Schema, Type } from '../core.ts';
import type { AdditionalProperties } from '../keywords/additionalProperties.ts';
import type { AllOf } from '../keywords/allOf.ts';
import type { AnyOf } from '../keywords/anyOf.ts';
import type { Const } from '../keywords/const.ts';
import type { Enum } from '../keywords/enum.ts';
import type { Items } from '../keywords/items.ts';
import type { OneOf } from '../keywords/oneOf.ts';
import type { PrefixItems } from '../keywords/prefixItems.ts';
import type { Properties } from '../keywords/properties.ts';
import type { Required as RequiredProperties } from '../keywords/required.ts';
import type { ResolveJSONPointerURL } from '../pointer.ts';

export type JSONSchema = Schema<JSONSchemaVocabulary>;

export interface JSONSchemaVocabulary
  extends Partial<
    AdditionalProperties<JSONSchemaVocabulary> &
      AllOf<JSONSchemaVocabulary> &
      AnyOf<JSONSchemaVocabulary> &
      Const &
      Enum &
      Items<JSONSchemaVocabulary> &
      OneOf<JSONSchemaVocabulary> &
      Properties<JSONSchemaVocabulary> &
      RequiredProperties &
      Type
  > {
  [x: keyof any]: unknown;
}

// biome-ignore format:
export type ParseJSONSchema<TSchema extends JSONSchema, TScope = TSchema> =
  TSchema extends true ? unknown :
  TSchema extends false ? never :
  TSchema extends JSONSchemaVocabulary ? ParseJSONSchemaVocabulary<TSchema, TScope> : never;

// biome-ignore format:
export type ParseJSONSchemaVocabulary<TSchema extends JSONSchemaVocabulary, TScope> =
  TSchema extends { $ref: string; } ? ParseReference<TSchema['$ref'], TScope> :
  (TSchema extends Type ? ParseType<TSchema['type']> : unknown) &
  NeverToUnknown<
    | (TSchema extends RequireAtLeastOne<
        Items<JSONSchemaVocabulary> & PrefixItems<JSONSchemaVocabulary>
      >
        ? ParseItems<
            OrElse<TSchema['items'], false>,
            OrElse<TSchema['prefixItems'], []>,
            TScope
          >
        : never)
    | (TSchema extends RequireAtLeastOne<
        Properties<JSONSchemaVocabulary> &
          AdditionalProperties<JSONSchemaVocabulary>
      >
        ? ParseProperties<
            OrElse<TSchema['properties'], {}>,
            OrElse<TSchema['additionalProperties'], false>,
            OrElse<TSchema['required'], []>,
            TScope
          >
        : never)
  > &
  (TSchema extends Const ? TSchema['const'] : unknown) &
  (TSchema extends Enum ? TSchema['enum'][number] : unknown) &
  (TSchema extends AllOf<JSONSchemaVocabulary>
    ? Intersection<ParseSchemas<TSchema['allOf'], TScope>>
    : unknown) &
  (TSchema extends AnyOf<JSONSchemaVocabulary>
    ? ParseJSONSchema<TSchema['anyOf'][number], TScope>
    : unknown) &
  (TSchema extends OneOf<JSONSchemaVocabulary>
    ? ParseJSONSchema<TSchema['oneOf'][number], TScope>
    : unknown);

type ParseItems<
  TItems extends JSONSchema,
  TPrefixItems extends readonly JSONSchema[],
  TScopeRoot,
> = [
  ...ParseSchemas<TPrefixItems, TScopeRoot>,
  ...(TItems extends false ? [] : ParseJSONSchema<TItems, TScopeRoot>[]),
];

type ParseProperties<
  TProperties extends Record<string, JSONSchema>,
  TAdditionalProperties extends JSONSchema,
  TRequired extends readonly string[],
  TScope,
> = {
  [K in Extract<keyof TProperties, TRequired[number]>]: ParseJSONSchema<
    TProperties[K],
    TScope
  >;
} & {
  [K in Exclude<keyof TProperties, TRequired[number]>]?: ParseJSONSchema<
    TProperties[K],
    TScope
  >;
} & (TAdditionalProperties extends false
    ? {}
    : {
        [key: string]: ParseJSONSchema<TAdditionalProperties, TScope>;
      });

type ParseReference<TRef extends string, TScope> = ParseJSONSchema<
  Extract<ResolveJSONPointerURL<TRef, TScope>, JSONSchema>,
  TScope
>;

type ParseSchemas<TSchema extends readonly JSONSchema[], TScope> = {
  [K in keyof TSchema]: ParseJSONSchema<TSchema[K], TScope>;
};

type Intersection<T extends readonly any[]> = T extends [
  infer Head,
  ...infer Tail extends any[],
]
  ? Head & Intersection<Tail>
  : unknown;

type NeverToUnknown<T> = [T] extends [never] ? unknown : T;

type OrElse<T, U> = T extends {} ? T : U;

type RequireAtLeastOne<T extends Record<string, any>> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];
