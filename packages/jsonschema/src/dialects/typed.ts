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
export type ParseJSONSchema<T extends JSONSchema, TScope = T> =
  T extends true ? unknown :
  T extends false ? never :
  T extends JSONSchemaVocabulary ? ParseJSONSchemaVocabulary<T, TScope> : never;

// biome-ignore format:
export type ParseJSONSchemaVocabulary<T extends JSONSchemaVocabulary, TScope> =
  T extends { $ref: string; } ? ParseReference<T['$ref'], TScope> :
  (T extends Type ? ParseType<T['type']> : unknown) &
  NeverToUnknown<
    | (T extends RequireAtLeastOne<
        Items<JSONSchemaVocabulary> & PrefixItems<JSONSchemaVocabulary>
      >
        ? ParseItems<
            OrElse<T['items'], false>,
            OrElse<T['prefixItems'], []>,
            TScope
          >
        : never)
    | (T extends RequireAtLeastOne<
        Properties<JSONSchemaVocabulary> &
          AdditionalProperties<JSONSchemaVocabulary>
      >
        ? ParseProperties<
            OrElse<T['properties'], {}>,
            OrElse<T['additionalProperties'], false>,
            OrElse<T['required'], []>,
            TScope
          >
        : never)
  > &
  (T extends Const ? T['const'] : unknown) &
  (T extends Enum ? T['enum'][number] : unknown) &
  (T extends AllOf<JSONSchemaVocabulary>
    ? Intersection<ParseSchemas<T['allOf'], TScope>>
    : unknown) &
  (T extends AnyOf<JSONSchemaVocabulary>
    ? ParseJSONSchema<T['anyOf'][number], TScope>
    : unknown) &
  (T extends OneOf<JSONSchemaVocabulary>
    ? ParseJSONSchema<T['oneOf'][number], TScope>
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

type ParseSchemas<T extends readonly JSONSchema[], TScope> = {
  [K in keyof T]: ParseJSONSchema<T[K], TScope>;
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
