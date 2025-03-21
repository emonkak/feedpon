import type { ParseType, Schema, Type } from './core.ts';
import type { AdditionalProperties } from './keywords/additionalProperties.ts';
import type { AllOf } from './keywords/allOf.ts';
import type { AnyOf } from './keywords/anyOf.ts';
import type { Const } from './keywords/const.ts';
import type { Enum } from './keywords/enum.ts';
import type { Items } from './keywords/items.ts';
import type { OneOf } from './keywords/oneOf.ts';
import type { PrefixItems } from './keywords/prefixItems.ts';
import type { Properties } from './keywords/properties.ts';
import type { Required as RequiredProperties } from './keywords/required.ts';
import type { UnescapeJSONPointerComponent } from './pointer.ts';

export type TypedSchema = Schema<TypedSchemaVocabulary>;

export interface TypedSchemaVocabulary
  extends Partial<
    AdditionalProperties<TypedSchemaVocabulary> &
      AllOf<TypedSchemaVocabulary> &
      AnyOf<TypedSchemaVocabulary> &
      Const &
      Enum &
      Items<TypedSchemaVocabulary> &
      OneOf<TypedSchemaVocabulary> &
      Properties<TypedSchemaVocabulary> &
      RequiredProperties &
      Type
  > {
  [x: keyof any]: unknown;
}

// biome-ignore format:
export type ParseTypedSchema<T extends TypedSchema, TScope = T> =
  T extends true ? unknown :
  T extends false ? never :
  T extends TypedSchemaVocabulary ? ParseVocabulary<
    T,
    T extends { $id: string } ? T : TScope
  > : never;

// biome-ignore format:
type ParseVocabulary<T extends TypedSchemaVocabulary, TScope> =
  T extends { $ref: string } ? ParseReference<T['$ref'], TScope> :
  (T extends Type ? ParseType<T['type']> : unknown) &
  (T extends RequireAtLeastOne<
    Items<TypedSchemaVocabulary> & PrefixItems<TypedSchemaVocabulary>
  >
    ? ParseItems<
        OrElse<T['items'], false>,
        OrElse<T['prefixItems'], []>,
        TScope
      >
    : unknown) &
  (T extends RequireAtLeastOne<
    Properties<TypedSchemaVocabulary> &
      AdditionalProperties<TypedSchemaVocabulary>
  >
    ? ParseProperties<
        OrElse<T['properties'], {}>,
        OrElse<T['additionalProperties'], false>,
        OrElse<T['required'], []>,
        TScope
      >
    : unknown) &
  (T extends Const ? T['const'] : unknown) &
  (T extends Enum ? T['enum'][number] : unknown) &
  (T extends AllOf<TypedSchemaVocabulary>
    ? Intersection<ParseSchemas<T['allOf'], TScope>>
    : unknown) &
  (T extends AnyOf<TypedSchemaVocabulary>
    ? ParseTypedSchema<T['anyOf'][number], TScope>
    : unknown) &
  (T extends OneOf<TypedSchemaVocabulary>
    ? ParseTypedSchema<T['oneOf'][number], TScope>
    : unknown);

type ParseItems<
  TItems extends TypedSchema,
  TPrefixItems extends readonly TypedSchema[],
  TScopeRoot,
> = [
  ...ParseSchemas<TPrefixItems, TScopeRoot>,
  ...(TItems extends false ? [] : ParseTypedSchema<TItems, TScopeRoot>[]),
];

type ParseProperties<
  TProperties extends Record<string, TypedSchema>,
  TAdditionalProperties extends TypedSchema,
  TRequired extends readonly string[],
  TScope,
> = {
  [K in Extract<keyof TProperties, TRequired[number]>]: ParseTypedSchema<
    TProperties[K],
    TScope
  >;
} & {
  [K in Exclude<keyof TProperties, TRequired[number]>]?: ParseTypedSchema<
    TProperties[K],
    TScope
  >;
} & (TAdditionalProperties extends false
    ? {}
    : {
        [key: string]: ParseTypedSchema<TAdditionalProperties, TScope>;
      });

type ParseReference<TRef extends string, TScope> = ParseTypedSchema<
  Extract<ResolveReference<TScope, TRef>, TypedSchema>,
  FindScope<TScope, TRef>
>;

type ParseSchemas<T extends readonly TypedSchema[], TScope> = {
  [K in keyof T]: ParseTypedSchema<T[K], TScope>;
};

type ResolveReference<T, TRef extends string> = TRef extends '#'
  ? T
  : TRef extends `#/${infer Path}`
    ? LookupObject<T, UnescapePath<Split<Path, '/'>>>
    : never;

type FindScope<T, TRef extends string> = TRef extends '#'
  ? T
  : TRef extends `#/${infer Path}`
    ? FindArray<Reverse<ScanObject<T, Split<Path, '/'>>>, { $id: string }>
    : never;

type LookupObject<T, TPath extends string[]> = TPath extends [
  infer Head extends keyof T,
  ...infer Tail extends string[],
]
  ? LookupObject<T[Head], Tail>
  : T;

type ScanObject<T, TPath extends string[]> = UnescapePath<TPath> extends [
  infer Head extends keyof T,
  ...infer Tail extends string[],
]
  ? [T[Head], ...ScanObject<T[Head], Tail>]
  : never;

type FindArray<T extends any[], TConstraint> = T extends [
  infer Head,
  ...infer Tail,
]
  ? Head extends TConstraint
    ? Head
    : FindArray<Tail, TConstraint>
  : never;

type Intersection<T extends readonly any[]> = T extends [
  infer Head,
  ...infer Tail extends any[],
]
  ? Head & Intersection<Tail>
  : unknown;

type OrElse<T, U> = T extends {} ? T : U;

type RequireAtLeastOne<T extends Record<string, any>> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

type Reverse<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
  ? [...Reverse<Tail>, Head]
  : [];

type Split<
  T extends string,
  TSeparator extends string,
> = T extends `${infer Head}${TSeparator}${infer Tail}`
  ? [Head, ...Split<Tail, TSeparator>]
  : T extends ''
    ? []
    : [T];

type UnescapePath<T extends string[]> = {
  [K in keyof T]: UnescapeJSONPointerComponent<T[K]>;
};
