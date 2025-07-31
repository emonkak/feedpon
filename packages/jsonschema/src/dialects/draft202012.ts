import { anyKeywords, typeOf } from '../constraint.ts';
import type {
  HasErrorReports,
  HasEvaluatedLocations,
  HasSchemaConstraint,
} from '../context.ts';
import type {
  Constraint,
  CoreVocabulary,
  Dialect,
  Schema,
  Type,
  ValidationResult,
} from '../core.ts';
import {
  type AdditionalProperties,
  additionalProperties,
} from '../keywords/additionalProperties.ts';
import { type AllOf, allOf } from '../keywords/allOf.ts';
import { type AnyOf, anyOf } from '../keywords/anyOf.ts';
import { type Const, constValue } from '../keywords/const.ts';
import { type Contains, contains } from '../keywords/contains.ts';
import {
  type DependentRequired,
  dependentRequired,
} from '../keywords/dependentRequired.ts';
import {
  type DependentSchemas,
  dependentSchemas,
} from '../keywords/dependentSchemas.ts';
import { type Enum, enumValues } from '../keywords/enum.ts';
import {
  type ExclusiveMaximum,
  exclusiveMaximum,
} from '../keywords/exclusiveMaximum.ts';
import {
  type ExclusiveMinimum,
  exclusiveMinimum,
} from '../keywords/exclusiveMinimum.ts';
import { type IfThenElse, ifThenElse } from '../keywords/ifThenElse.ts';
import { type Items, items } from '../keywords/items.ts';
import { type MaxItems, maxItems } from '../keywords/maxItems.ts';
import { type Maximum, maximum } from '../keywords/maximum.ts';
import { type MaxLength, maxLength } from '../keywords/maxLength.ts';
import {
  type MaxProperties,
  maxProperties,
} from '../keywords/maxProperties.ts';
import { type MinItems, minItems } from '../keywords/minItems.ts';
import { type Minimum, minimum } from '../keywords/minimum.ts';
import { type MinLength, minLength } from '../keywords/minLength.ts';
import {
  type MinProperties,
  minProperties,
} from '../keywords/minProperties.ts';
import type { MultipleOf } from '../keywords/multipleOf.ts';
import { type Not, not } from '../keywords/not.ts';
import { type OneOf, oneOf } from '../keywords/oneOf.ts';
import { type Pattern, pattern } from '../keywords/pattern.ts';
import {
  type PatternProperties,
  patternProperties,
} from '../keywords/patternProperties.ts';
import { type PrefixItems, prefixItems } from '../keywords/prefixItems.ts';
import { type Properties, properties } from '../keywords/properties.ts';
import {
  type PropertyNames,
  propertyNames,
} from '../keywords/propertyNames.ts';
import {
  type Required as RequiredProperties,
  required,
} from '../keywords/required.ts';
import {
  type UnevaluatedItems,
  unevaluatedItems,
} from '../keywords/unevaluatedItems.ts';
import {
  type UnevaluatedProperties,
  unevaluatedProperties,
} from '../keywords/unevaluatedProperties.ts';
import { type UniqueItems, uniqueItems } from '../keywords/uniqueItems.ts';

export type JSONSchema = Schema<JSONSchemaVocabulary>;

export interface JSONSchemaContext
  extends HasErrorReports<JSONSchemaVocabulary>,
    HasEvaluatedLocations,
    HasSchemaConstraint<JSONSchemaVocabulary, JSONSchemaContext> {}

export interface JSONSchemaVocabulary
  extends CoreVocabulary<JSONSchemaVocabulary>,
    ApplicatorVocabulary<JSONSchemaVocabulary>,
    ValidationVocabulary,
    UnevaluatedVocabulary<JSONSchemaVocabulary>,
    FormatVocabulary,
    ContentVocabulary<JSONSchemaVocabulary>,
    MetadataVocabulary {}

type ApplicatorVocabulary<TVocabulary> = Partial<
  AllOf<TVocabulary> &
    AnyOf<TVocabulary> &
    OneOf<TVocabulary> &
    IfThenElse<TVocabulary> &
    Not<TVocabulary> &
    UnevaluatedItems<TVocabulary> &
    Properties<TVocabulary> &
    AdditionalProperties<TVocabulary> &
    PatternProperties<TVocabulary> &
    DependentSchemas<TVocabulary> &
    PropertyNames<TVocabulary> &
    Contains<TVocabulary> &
    Items<TVocabulary> &
    PrefixItems<TVocabulary>
>;

type ValidationVocabulary = Partial<
  Type &
    Const &
    Enum &
    MultipleOf &
    Maximum &
    ExclusiveMaximum &
    Minimum &
    ExclusiveMinimum &
    MaxLength &
    MinLength &
    Pattern &
    MaxItems &
    MinItems &
    UniqueItems &
    MaxProperties &
    MinProperties &
    RequiredProperties &
    DependentRequired
>;

type UnevaluatedVocabulary<TVocabulary> = Partial<
  UnevaluatedItems<TVocabulary> & UnevaluatedProperties<TVocabulary>
>;

interface FormatVocabulary {
  format?: string;
}

interface ContentVocabulary<TVocabulary> {
  contentEncoding?: string;
  contentMediaType?: string;
  contentSchema?: TVocabulary;
}

interface MetadataVocabulary {
  title?: string;
  description?: string;
  default?: unknown;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: unknown[];
}

type PickProperties<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

const SCHEMA_KEYS = [
  'additionalProperties',
  'contains',
  'contentSchema',
  'else',
  'if',
  'items',
  'not',
  'propertyNames',
  'then',
  'unevaluatedItems',
  'unevaluatedProperties',
] as const satisfies (keyof PickProperties<
  JSONSchemaVocabulary,
  JSONSchema | undefined
>)[];
const SCHEMA_ARRRAY_KEYS = [
  'allOf',
  'anyOf',
  'oneOf',
  'prefixItems',
] as const satisfies (keyof PickProperties<
  JSONSchemaVocabulary,
  readonly JSONSchema[] | undefined
>)[];
const SCHEMA_OBJECT_KEYS = [
  '$defs',
  'dependentSchemas',
  'patternProperties',
  'properties',
] as const satisfies (keyof PickProperties<
  JSONSchemaVocabulary,
  Record<string, JSONSchema> | undefined
>)[];

const arrayConstraint: Constraint<
  unknown[],
  JSONSchemaVocabulary,
  JSONSchemaContext
> = anyKeywords({
  maxItems,
  minItems,
  uniqueItems,
  contains: contains<JSONSchemaVocabulary, JSONSchemaContext>,
  prefixItems: prefixItems<JSONSchemaVocabulary, JSONSchemaContext>,
  items: items<JSONSchemaVocabulary, JSONSchemaContext>,
  const: constValue,
  enum: enumValues,
  allOf: allOf<JSONSchemaVocabulary, JSONSchemaContext>,
  anyOf: anyOf<JSONSchemaVocabulary, JSONSchemaContext>,
  oneOf: oneOf<JSONSchemaVocabulary, JSONSchemaContext>,
  if: ifThenElse<JSONSchemaVocabulary, JSONSchemaContext>,
  not: not<JSONSchemaVocabulary, JSONSchemaContext>,
  unevaluatedItems: unevaluatedItems<JSONSchemaVocabulary, JSONSchemaContext>,
});

const unknownConstraint: Constraint<
  unknown,
  JSONSchemaVocabulary,
  JSONSchemaContext
> = anyKeywords({
  const: constValue,
  enum: enumValues,
  allOf: allOf<JSONSchemaVocabulary, JSONSchemaContext>,
  anyOf: anyOf<JSONSchemaVocabulary, JSONSchemaContext>,
  oneOf: oneOf<JSONSchemaVocabulary, JSONSchemaContext>,
  if: ifThenElse<JSONSchemaVocabulary, JSONSchemaContext>,
  not: not<JSONSchemaVocabulary, JSONSchemaContext>,
});

const numberConstraint: Constraint<
  number,
  JSONSchemaVocabulary,
  JSONSchemaContext
> = anyKeywords({
  maximum,
  minimum,
  exclusiveMaximum,
  exclusiveMinimum,
  const: constValue,
  eunm: enumValues,
  allOf: allOf<JSONSchemaVocabulary, JSONSchemaContext>,
  anyOf: anyOf<JSONSchemaVocabulary, JSONSchemaContext>,
  oneOf: oneOf<JSONSchemaVocabulary, JSONSchemaContext>,
  if: ifThenElse<JSONSchemaVocabulary, JSONSchemaContext>,
  not: not<JSONSchemaVocabulary, JSONSchemaContext>,
});

const objectConstraint: Constraint<
  object,
  JSONSchemaVocabulary,
  JSONSchemaContext
> = anyKeywords({
  maxProperties,
  minProperties,
  required,
  dependentRequired,
  propertyNames: propertyNames<JSONSchemaVocabulary, JSONSchemaContext>,
  dependentSchemas: dependentSchemas<JSONSchemaVocabulary, JSONSchemaContext>,
  properties: properties<JSONSchemaVocabulary, JSONSchemaContext>,
  patternProperties: patternProperties<JSONSchemaVocabulary, JSONSchemaContext>,
  additionalProperties: additionalProperties<
    JSONSchemaVocabulary,
    JSONSchemaContext
  >,
  const: constValue,
  enum: enumValues,
  allOf: allOf<JSONSchemaVocabulary, JSONSchemaContext>,
  anyOf: anyOf<JSONSchemaVocabulary, JSONSchemaContext>,
  oneOf: oneOf<JSONSchemaVocabulary, JSONSchemaContext>,
  if: ifThenElse<JSONSchemaVocabulary, JSONSchemaContext>,
  not: not<JSONSchemaVocabulary, JSONSchemaContext>,
  unevaluatedProperties: unevaluatedProperties<
    JSONSchemaVocabulary,
    JSONSchemaContext
  >,
});

const stringConstraint: Constraint<
  string,
  JSONSchemaVocabulary,
  JSONSchemaContext
> = anyKeywords({
  maxLength,
  minLength,
  pattern,
  const: constValue,
  enum: enumValues,
  allOf: allOf<JSONSchemaVocabulary, JSONSchemaContext>,
  anyOf: anyOf<JSONSchemaVocabulary, JSONSchemaContext>,
  oneOf: oneOf<JSONSchemaVocabulary, JSONSchemaContext>,
  if: ifThenElse<JSONSchemaVocabulary, JSONSchemaContext>,
  not: not<JSONSchemaVocabulary, JSONSchemaContext>,
});

export const draft202012: Dialect<JSONSchemaVocabulary, JSONSchemaContext> = {
  constraint: typeOf({
    array: arrayConstraint,
    boolean: unknownConstraint,
    integer: numberConstraint,
    null: unknownConstraint,
    number: numberConstraint,
    object: objectConstraint,
    string: stringConstraint,
  }),
  validate(
    value: unknown,
    schema: JSONSchema,
    constraint: Constraint<unknown, JSONSchema, JSONSchemaContext>,
  ): ValidationResult<JSONSchemaVocabulary> {
    const context = {
      errors: [],
      evaluatedLocations: { index: -1, properties: null },
      schemaConstraint: constraint,
    };
    const valid = constraint(value, schema, context);
    return {
      valid,
      errors: context.errors,
    } as ValidationResult<JSONSchemaVocabulary>;
  },
  *traverse(schema: JSONSchemaVocabulary): Generator<JSONSchemaVocabulary> {
    for (let i = 0, l = SCHEMA_KEYS.length; i < l; i++) {
      const key = SCHEMA_KEYS[i]!;
      const value = schema[key];
      if (typeof value === 'object') {
        yield value;
      }
    }

    for (let i = 0, l = SCHEMA_ARRRAY_KEYS.length; i < l; i++) {
      const key = SCHEMA_ARRRAY_KEYS[i]!;
      const values = schema[key];
      if (values !== undefined) {
        for (let i = 0, l = values.length; i < l; i++) {
          const value = values[i];
          if (typeof value === 'object') {
            yield value;
          }
        }
      }
    }

    for (let i = 0, l = SCHEMA_OBJECT_KEYS.length; i < l; i++) {
      const key = SCHEMA_OBJECT_KEYS[i]!;
      const dictionary = schema[key];
      if (dictionary !== undefined) {
        for (const value of Object.values(dictionary)) {
          if (typeof value === 'object') {
            yield value;
          }
        }
      }
    }
  },
};
