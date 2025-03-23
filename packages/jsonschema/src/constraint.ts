import type { HasErrorReports } from './context.ts';
import type { Constraint, ParseType, PrimitiveType, Type } from './core.ts';
import { quote, show } from './helpers.ts';

type TypeConstraints<TVocabulary, TContext> = {
  [T in PrimitiveType]: Constraint<ParseType<T>, TVocabulary, TContext>;
};

type IntersectType<T extends Record<string, Constraint<any, any, any>>> =
  T[keyof T] extends Constraint<infer Value, any, any> ? Value : never;

type IntersectSchema<T extends Record<string, Constraint<any, any, any>>> =
  Partial<
    T[keyof T] extends Constraint<any, infer Schema, any> ? Schema : never
  >;

type IntersectContext<T extends Record<string, Constraint<any, any, any>>> =
  T[keyof T] extends Constraint<any, any, infer Context> ? Context : never;

export function anyKeywords<
  const TConstraints extends Record<string, Constraint<any, any, any>>,
>(
  keywordConstraints: TConstraints,
): Constraint<
  IntersectType<TConstraints>,
  IntersectSchema<TConstraints>,
  IntersectContext<TConstraints>
> {
  return (value, schema, context) => {
    let valid = true;
    for (const key of Object.keys(keywordConstraints)) {
      if (
        schema[key as keyof typeof schema] !== undefined &&
        !keywordConstraints[key]!(value, schema, context)
      ) {
        valid = false;
      }
    }
    return valid;
  };
}

export function typeOf<TConstraints extends TypeConstraints<any, any>>(
  typeConstraints: TConstraints,
): Constraint<
  unknown,
  IntersectSchema<TConstraints> & Partial<Type>,
  IntersectContext<TConstraints> &
    HasErrorReports<IntersectSchema<TConstraints> & Partial<Type>>
> {
  return (value, schema, context) => {
    const { type: expectedType } = schema;
    const actualType = inferType(value);

    if (actualType === null) {
      context.errors.push({
        error: `Value must have a valid JSON data type, but got ${show(value)}.`,
        instanceLocation: '',
        keywordLocation: '',
        absoluteKeywordLocation: '',
        value,
        schema,
      });
      return false;
    }

    if (expectedType !== undefined) {
      if (Array.isArray(expectedType)) {
        if (expectedType.length === 0) {
          context.errors.push({
            error: 'No type is allowed.',
            instanceLocation: '',
            keywordLocation: '/type',
            absoluteKeywordLocation: '',
            value,
            schema,
          });
          return false;
        } else if (
          !expectedType.some((expectedType) =>
            matchType(actualType, expectedType),
          )
        ) {
          context.errors.push({
            error: `Type must be one of ${expectedType.map(quote).join(', ')}, but got ${show(value)}.`,
            instanceLocation: '',
            keywordLocation: '/type',
            absoluteKeywordLocation: '',
            value,
            schema,
          });
          return false;
        }
      } else if (!matchType(actualType, expectedType)) {
        context.errors.push({
          error: `Type must be ${quote(expectedType)}, but got ${show(value)}.`,
          instanceLocation: '',
          keywordLocation: '/type',
          absoluteKeywordLocation: '',
          value,
          schema,
        });
        return false;
      }
    }

    const typeConstraint = typeConstraints[actualType] as Constraint<
      unknown,
      typeof schema,
      typeof context
    >;

    return typeConstraint(value, schema, context);
  };
}

function inferType(value: unknown): PrimitiveType | null {
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return Number.isNaN(value)
        ? null
        : Number.isInteger(value)
          ? 'integer'
          : 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return value === null
        ? 'null'
        : Array.isArray(value)
          ? 'array'
          : 'object';
    default:
      return null;
  }
}

function matchType(
  actualType: PrimitiveType,
  expectedType: PrimitiveType,
): boolean {
  return (
    actualType === expectedType ||
    (expectedType === 'number' && actualType === 'integer')
  );
}
