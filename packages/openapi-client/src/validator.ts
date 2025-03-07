import {
  type ParseSchema,
  type PrimitiveType,
  type Schema,
  type SchemaObject,
  lookupReference,
} from './schema.ts';

export type SchemaValidator = <
  TSchema extends Schema,
  TDocumentRoot extends object,
>(
  value: unknown,
  schema: TSchema,
  documentRoot: TDocumentRoot,
) => ParseSchema<TSchema, TDocumentRoot>;

export interface ValidationOptions {
  baseURI?: string;
  documentRoot?: object;
}

export interface Violation {
  message: string;
  location: ViolationLocation;
  value: unknown;
  schema: Schema;
}

export type ViolationLocation = (string | number)[];

interface ValidationContext {
  baseURI: string;
  documentRoot: object;
  dynamicNamespaces: DynamicNamespace[];
  evaluatedIndexMap: WeakMap<unknown[], { value: number }>;
  evaluatedPropertiesMap: WeakMap<object, Set<string>>;
  staticReferences: Map<string, Schema>;
  violations: Violation[];
}

type DynamicNamespace = {
  schema: Schema;
  references: Map<string, Schema>;
};

export const defaultSchemaValidator: SchemaValidator = <
  T extends Schema,
  TDocumentRoot extends object,
>(
  value: unknown,
  schema: T,
  documentRoot: TDocumentRoot,
) => {
  const violations = validate(value, schema, { documentRoot });
  if (violations.length > 0) {
    throw ValidationError.fromViolations(violations);
  }
  return value as ParseSchema<T, TDocumentRoot>;
};

export class ValidationError extends Error {
  private readonly _violations: Violation[];

  static fromViolations(
    violations: Violation[],
    options?: ErrorOptions,
  ): ValidationError {
    const groupedViolations = Map.groupBy(violations, (violation) =>
      formatLocation(violation.location),
    );
    const message =
      `Validation failed with ${violations.length} violation(s) at ${groupedViolations.size} location(s):\n` +
      groupedViolations
        .entries()
        .map(
          ([location, violations]) =>
            `at "${location}":\n` +
            violations
              .map((violation) => '  - ' + violation.message)
              .join('\n'),
        )
        .toArray()
        .join('\n');

    return new ValidationError(message, violations, options);
  }

  constructor(
    message: string,
    violations: Violation[],
    options?: ErrorOptions,
  ) {
    super(message, options);
    this._violations = violations;
  }

  get violations(): Violation[] {
    return this._violations;
  }
}

export function validate(
  value: unknown,
  schema: Schema,
  options: ValidationOptions = {},
): Violation[] {
  const context = {
    baseURI: options.baseURI ?? 'file://',
    documentRoot:
      options.documentRoot ?? (typeof schema === 'object' ? schema : {}),
    dynamicNamespaces: [],
    evaluatedIndexMap: new WeakMap(),
    evaluatedPropertiesMap: new WeakMap(),
    staticReferences: new Map(),
    violations: [],
  };
  if (!validateUnknown(value, schema, context)) {
    reverseLocations(context.violations);
  }
  return context.violations;
}

function validateUnknown(
  value: unknown,
  schema: Schema,
  context: ValidationContext,
): boolean {
  if (schema === true) {
    return true;
  }

  if (schema === false) {
    context.violations.push({
      message: 'No value is allowed.',
      location: [],
      value,
      schema,
    });
    return false;
  }

  const { type } = schema;

  if (type === undefined) {
    return validateAny(value, schema, context);
  }

  if (type.length === 0) {
    context.violations.push({
      message: 'No type is allowed.',
      location: [],
      value,
      schema,
    });
    return false;
  }

  switch (typeof value) {
    case 'string':
      if (matchType(type, 'string')) {
        return validateString(value, schema, context);
      }
      break;
    case 'number':
      if (
        !Number.isNaN(value) &&
        (matchType(type, 'number') ||
          (Number.isInteger(value) && matchType(type, 'integer')))
      ) {
        return validateNumber(value, schema, context);
      }
      break;
    case 'boolean':
      if (matchType(type, 'boolean')) {
        return validateBoolean(value, schema, context);
      }
      break;
    case 'object':
      if (value === null) {
        if (matchType(type, 'null')) {
          return validateNull(schema, context);
        }
      } else if (Array.isArray(value)) {
        if (matchType(type, 'array')) {
          return validateArray(value, schema, context);
        }
      } else {
        if (matchType(type, 'object')) {
          return validateObject(value, schema, context);
        }
      }
      break;
  }

  context.violations.push({
    message: Array.isArray(type)
      ? `Type must be one of ${type.map(quote).join(', ')}, but got ${nameOf(value)}.`
      : `Type must be ${quote(type)}, but got ${nameOf(value)}.`,
    location: [],
    value,
    schema,
  });

  return false;
}

function validateAny(
  value: unknown,
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  switch (typeof value) {
    case 'string':
      return validateString(value, schema, context);
    case 'number':
      if (!Number.isNaN(value)) {
        return validateNumber(value, schema, context);
      }
      break;
    case 'boolean':
      return validateBoolean(value, schema, context);
    case 'object':
      return value === null
        ? validateNull(schema, context)
        : Array.isArray(value)
          ? validateArray(value, schema, context)
          : validateObject(value, schema, context);
  }

  context.violations.push({
    message: `Value must have a valid JSON data type, but got ${nameOf(value)}.`,
    location: [],
    value,
    schema,
  });

  return false;
}

function validateArray(
  value: unknown[],
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  const {
    contains,
    items,
    maxContains,
    maxItems,
    minContains,
    minItems,
    prefixItems,
    uniqueItems = false,
    unevaluatedItems,
  } = schema;
  const evaluatedIndex = getOrInsert(context.evaluatedIndexMap, value, () => ({
    value: 0,
  }));
  let result = true;

  if (!validatePreType(value, schema, context)) {
    result = false;
  }

  if (maxItems !== undefined && value.length > maxItems) {
    context.violations.push({
      message: `Array must have at most ${maxItems} items, but got ${value.length}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (minItems !== undefined && value.length < minItems) {
    context.violations.push({
      message: `Array must have at least ${minItems} items, but got ${value.length}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (uniqueItems) {
    if (new Set(value).size !== value.length) {
      context.violations.push({
        message: 'Array items must be unique.',
        location: [],
        value,
        schema,
      });
      result = false;
    }
  }

  if (contains !== undefined) {
    let matchCount = 0;

    for (let i = 0, l = value.length; i < l; i++) {
      if (validateUnknown(value[i], contains, cloneContext(context))) {
        matchCount++;
      } else {
        result = false;
      }
    }

    if (minContains !== undefined && matchCount < minContains) {
      context.violations.push({
        message: `Array must contain at least ${minContains} items matching the "contains" schema, but found ${matchCount}.`,
        location: [],
        value,
        schema,
      });
      result = false;
    }

    if (maxContains !== undefined && matchCount > maxContains) {
      context.violations.push({
        message: `Array must contain at most ${maxContains} items matching the "contains" schema, but found ${matchCount}.`,
        location: [],
        value,
        schema,
      });
      result = false;
    }

    if (schema.minContains === undefined && matchCount === 0) {
      context.violations.push({
        message:
          'Array must contain at least one item matching the "contains" schema.',
        location: [],
        value,
        schema,
      });
      result = false;
    }

    evaluatedIndex.value = value.length;
  }

  if (prefixItems !== undefined) {
    for (
      let i = 0, l = Math.min(prefixItems.length, value.length);
      i < l;
      i++
    ) {
      const position = context.violations.length;
      if (!validateUnknown(value[i], prefixItems[i]!, context)) {
        fixLocations(context.violations, position, i);
        result = false;
      }
    }
    evaluatedIndex.value = Math.max(
      evaluatedIndex.value,
      Math.min(prefixItems.length, value.length),
    );
  }

  if (items !== undefined) {
    for (let i = prefixItems?.length ?? 0, l = value.length; i < l; i++) {
      const position = context.violations.length;
      if (!validateUnknown(value[i], items, context)) {
        fixLocations(context.violations, position, i);
        result = false;
      }
    }
    evaluatedIndex.value = value.length;
  }

  if (!validatePostType(value, schema, context)) {
    result = false;
  }

  if (unevaluatedItems !== undefined) {
    for (let i = evaluatedIndex.value, l = value.length; i < l; i++) {
      const position = context.violations.length;
      if (!validateUnknown(value[i], unevaluatedItems, context)) {
        fixLocations(context.violations, position, i);
        result = false;
      }
    }
    evaluatedIndex.value = value.length;
  }

  return result;
}

function validateBoolean(
  value: boolean,
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  let result = true;

  if (!validatePreType(value, schema, context)) {
    result = false;
  }

  if (!validatePostType(value, schema, context)) {
    result = false;
  }

  return result;
}

function validateNull(
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  let result = true;

  if (!validatePreType(null, schema, context)) {
    result = false;
  }

  if (!validatePostType(null, schema, context)) {
    result = false;
  }

  return result;
}

function validateNumber(
  value: number,
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  const { exclusiveMaximum, exclusiveMinimum, maximum, minimum, multipleOf } =
    schema;
  let result = true;

  if (!validatePreType(value, schema, context)) {
    result = false;
  }

  if (maximum !== undefined && value > maximum) {
    context.violations.push({
      message: `Number must be at most ${maximum}, but got ${value}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (exclusiveMaximum !== undefined && value >= exclusiveMaximum) {
    context.violations.push({
      message: `Number must be less than ${exclusiveMaximum}, but got ${value}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (minimum !== undefined && value < minimum) {
    context.violations.push({
      message: `Number must be at least ${minimum}, but got ${value}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (exclusiveMinimum !== undefined && value <= exclusiveMinimum) {
    context.violations.push({
      message: `Number must be greater than ${exclusiveMinimum}, but got ${value}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (multipleOf !== undefined && Math.floor(value % multipleOf) !== 0) {
    context.violations.push({
      message: `Number must be a multiple of ${multipleOf}, but got ${value}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (!validatePostType(value, schema, context)) {
    result = false;
  }

  return result;
}

function validateObject(
  value: object,
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  const {
    additionalProperties,
    dependentRequired,
    dependentSchemas,
    maxProperties,
    minProperties,
    patternProperties,
    properties,
    propertyNames,
    required,
    unevaluatedProperties,
  } = schema;
  const keys = Object.keys(value);
  const evaluatedProperties = getOrInsert(
    context.evaluatedPropertiesMap,
    value,
    () => new Set(),
  );
  let result = true;

  if (!validatePreType(value, schema, context)) {
    result = false;
  }

  if (maxProperties !== undefined && keys.length > maxProperties) {
    context.violations.push({
      message: `Object must have at most ${maxProperties} properties, but got ${keys.length}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (minProperties !== undefined && keys.length < minProperties) {
    context.violations.push({
      message: `Object must have at least ${minProperties} properties, but got ${keys.length}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (required !== undefined) {
    for (const key of required) {
      if (!Object.hasOwn(value, key)) {
        context.violations.push({
          message: `Object must have property ${quote(key)}, but it is undefined.`,
          location: [],
          value,
          schema,
        });
        result = false;
      }
    }
  }

  if (dependentRequired !== undefined) {
    for (const key of Object.keys(dependentRequired)) {
      if (!Object.hasOwn(value, key)) {
        continue;
      }
      const dependentKeys = dependentRequired[key]!;
      if (
        !dependentKeys.every((dependentKey) =>
          Object.hasOwn(value, dependentKey),
        )
      ) {
        context.violations.push({
          message: `Object must have property ${quote(key)} when ${dependentKeys.map(quote).join(', ')} ${dependentKeys.length > 1 ? 'are' : 'is'} present, but it is undefined.`,
          location: [],
          value,
          schema,
        });
        result = false;
      }
    }
  }

  if (propertyNames !== undefined) {
    for (const key of keys) {
      const position = context.violations.length;
      if (!validateUnknown(key, propertyNames, context)) {
        fixLocations(context.violations, position, key);
        result = false;
      }
    }
  }

  if (dependentSchemas !== undefined) {
    for (const key of Object.keys(dependentSchemas)) {
      if (!Object.hasOwn(value, key)) {
        continue;
      }
      if (!validateUnknown(value, dependentSchemas[key]!, context)) {
        result = false;
      }
    }
  }

  if (properties !== undefined) {
    for (const key of Object.keys(properties)) {
      if (!Object.hasOwn(value, key)) {
        continue;
      }
      const position = context.violations.length;
      if (!validateUnknown((value as any)[key]!, properties[key]!, context)) {
        fixLocations(context.violations, position, key);
        result = false;
      }
      evaluatedProperties.add(key);
    }
  }

  if (patternProperties !== undefined) {
    for (const pattern of Object.keys(patternProperties)) {
      const regexp = new RegExp(pattern);
      for (const key of keys) {
        if (!regexp.test(key)) {
          continue;
        }
        const position = context.violations.length;
        if (
          !validateUnknown(
            (value as any)[key]!,
            patternProperties[pattern]!,
            context,
          )
        ) {
          fixLocations(context.violations, position, key);
          result = false;
        }
        evaluatedProperties.add(key);
      }
    }
  }

  if (additionalProperties !== undefined) {
    for (const key of keys) {
      if (evaluatedProperties.has(key)) {
        continue;
      }
      const position = context.violations.length;
      if (
        !validateUnknown((value as any)[key], additionalProperties, context)
      ) {
        fixLocations(context.violations, position, key);
        result = false;
      }
      evaluatedProperties.add(key);
    }
  }

  if (!validatePostType(value, schema, context)) {
    result = false;
  }

  if (unevaluatedProperties !== undefined) {
    for (const key of keys) {
      if (evaluatedProperties.has(key)) {
        continue;
      }
      const position = context.violations.length;
      if (
        !validateUnknown((value as any)[key]!, unevaluatedProperties, context)
      ) {
        fixLocations(context.violations, position, key);
        result = false;
      }
      evaluatedProperties.add(key);
    }
  }

  return result;
}

function validateString(
  value: string,
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  const { maxLength, minLength, pattern } = schema;
  const characterCount = value[Symbol.iterator]().reduce(
    (length) => length + 1,
    0,
  );
  let result = true;

  if (!validatePreType(value, schema, context)) {
    result = false;
  }

  if (maxLength !== undefined && characterCount > maxLength) {
    context.violations.push({
      message: `String must have at most ${maxLength} characters, but got ${value.length}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (minLength !== undefined && characterCount < minLength) {
    context.violations.push({
      message: `String must have at least ${minLength} characters, but got ${value.length}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (pattern !== undefined && !new RegExp(pattern).test(value)) {
    context.violations.push({
      message: `String does not match the required pattern ${quote(pattern)}.`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (!validatePostType(value, schema, context)) {
    result = false;
  }

  return result;
}

function validatePreType(
  value: unknown,
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  const { $defs, $dynamicRef, $ref } = schema;
  let dynamicReferences: Map<string, Schema> | null = null;
  let result = true;

  if ($dynamicRef !== undefined) {
    const url = toAbsoluteURL($dynamicRef, context.baseURI);
    const reference = lookupDynamicReference(context.dynamicNamespaces, url);
    if (!validateUnknown(value, reference, context)) {
      result = false;
    }
  }

  if ($defs !== undefined) {
    for (const key of Object.keys($defs)) {
      const def = $defs[key]!;
      if (typeof def === 'boolean') {
        continue;
      }
      const { $anchor, $dynamicAnchor, $id } = def;
      if ($id !== undefined) {
        const url = toAbsoluteURL($id, context.baseURI);
        context.staticReferences.set(url, def);
      }
      if ($anchor !== undefined) {
        const url = toAbsoluteURL('#' + $anchor, context.baseURI);
        context.staticReferences.set(url, def);
      }
      if ($dynamicAnchor !== undefined) {
        const url = toAbsoluteURL('#' + $dynamicAnchor, context.baseURI);
        (dynamicReferences ??= new Map()).set(url, def);
      }
    }
  }

  if (dynamicReferences !== null) {
    context.dynamicNamespaces.push({
      schema,
      references: dynamicReferences,
    });
  }

  if ($ref !== undefined) {
    const url = toAbsoluteURL($ref, context.baseURI);
    const reference =
      context.staticReferences.get(url) ??
      (lookupReference($ref, context.documentRoot) as Schema);
    if (!validateUnknown(value, reference, context)) {
      result = false;
    }
  }

  return result;
}

function validatePostType(
  value: unknown,
  schema: SchemaObject,
  context: ValidationContext,
): boolean {
  const {
    const: constValue,
    enum: enumValues,
    allOf,
    anyOf,
    oneOf,
    if: ifSchema,
    then: thenSchema = true,
    else: elseSchema = true,
    not: notSchema,
  } = schema;
  let result = true;

  if (constValue !== undefined && !deepEqual(constValue, value)) {
    context.violations.push({
      message: `Value must be ${nameOf(constValue)}, but got ${nameOf(value)}`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (
    enumValues !== undefined &&
    !enumValues.some((enumValue) => deepEqual(value, enumValue))
  ) {
    context.violations.push({
      message: `Value must be one of ${enumValues.map(nameOf).join(', ')}, but got ${nameOf(value)}`,
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (allOf !== undefined) {
    for (let i = 0, l = allOf.length; i < l; i++) {
      if (!validateUnknown(value, allOf[i]!, context)) {
        break;
      }
    }
  }

  if (anyOf !== undefined) {
    const subContext = cloneContext(context);
    let matchCount = 0;
    for (let i = 0, l = anyOf.length; i < l; i++) {
      if (validateUnknown(value, anyOf[i]!, subContext)) {
        matchCount++;
      }
    }
    if (matchCount === 0) {
      result = false;
      context.violations.push(...subContext.violations);
    }
  }

  if (oneOf !== undefined) {
    const subContext = cloneContext(context);
    let matchCount = 0;
    for (let i = 0, l = oneOf.length; i < l; i++) {
      if (validateUnknown(value, oneOf[i]!, subContext)) {
        matchCount++;
      }
    }
    if (matchCount === 0) {
      context.violations.push(...subContext.violations);
      result = false;
    } else if (matchCount > 1) {
      context.violations.push({
        message: 'Value matches multiple schemas, but only one is allowed.',
        location: [],
        value,
        schema,
      });
      result = false;
    }
  }

  if (
    ifSchema !== undefined &&
    !(validateUnknown(value, ifSchema, cloneContext(context))
      ? validateUnknown(value, thenSchema, context)
      : validateUnknown(value, elseSchema, context))
  ) {
    result = false;
  }

  if (
    notSchema !== undefined &&
    validateUnknown(value, notSchema, cloneContext(context))
  ) {
    context.violations.push({
      message: 'Value matches a forbidden schema.',
      location: [],
      value,
      schema,
    });
    result = false;
  }

  if (context.dynamicNamespaces.at(-1)?.schema === schema) {
    context.dynamicNamespaces.pop();
  }

  return result;
}

function cloneContext(context: ValidationContext): ValidationContext {
  return {
    baseURI: context.baseURI,
    documentRoot: context.documentRoot,
    dynamicNamespaces: context.dynamicNamespaces,
    evaluatedIndexMap: context.evaluatedIndexMap,
    evaluatedPropertiesMap: context.evaluatedPropertiesMap,
    staticReferences: context.staticReferences,
    violations: [],
  };
}

function deepEqual<T>(first: T, second: T): boolean {
  if (Object.is(first, second)) {
    return true;
  }

  if (
    first === null ||
    second === null ||
    typeof first !== 'object' ||
    typeof second !== 'object'
  ) {
    return false;
  }

  const firstKeys = Object.keys(first) as (keyof T)[];
  const secondKeys = Object.keys(second) as (keyof T)[];

  if (firstKeys.length !== secondKeys.length) {
    return false;
  }

  for (let i = 0, l = firstKeys.length; i < l; i++) {
    const key = firstKeys[i]!;
    if (!Object.hasOwn(second, key) || !deepEqual(first[key], second[key])) {
      return false;
    }
  }

  return true;
}

function fixLocations(
  violations: Violation[],
  position: number,
  key: string | number,
): void {
  for (let i = position, l = violations.length; i < l; i++) {
    violations[i]!.location.push(key);
  }
}

function formatLocation(location: ViolationLocation): string {
  return location.length === 0
    ? '.'
    : location
        .map((path) => (typeof path === 'string' ? `.${path}` : `[${path}]`))
        .join('');
}

function getOrInsert<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  getDefault: () => V,
): V {
  let value = map.get(key);
  if (value === undefined) {
    value = getDefault();
    map.set(key, value);
  }
  return value;
}

function lookupDynamicReference(
  namespaces: DynamicNamespace[],
  url: string,
): Schema {
  for (let i = namespaces.length - 1; i >= 0; i--) {
    const reference = namespaces[i]!.references.get(url);
    if (reference !== undefined) {
      return reference;
    }
  }
  throw new Error('Unresolved dynamic reference: ' + url);
}

function matchType(
  actualType: PrimitiveType | PrimitiveType[],
  expectedType: PrimitiveType,
): boolean {
  return typeof actualType === 'string'
    ? actualType === expectedType
    : actualType.includes(expectedType);
}

function nameOf(value: unknown): string {
  if (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    (typeof value === 'object' &&
      (value === null ||
        value.constructor === Object ||
        value.constructor === Array))
  ) {
    return JSON.stringify(value);
  } else if (typeof value === 'undefined') {
    return 'undefined';
  } else if (typeof value === 'function') {
    return value.name !== '' ? value.name : value.constructor.name;
  } else {
    return (value as any)[Symbol.toStringTag] ?? value.constructor.name;
  }
}

function quote(s: string): string {
  return '"' + s.replaceAll('"', '\\"') + '"';
}

function reverseLocations(violations: Violation[]): void {
  for (let i = 0, l = violations.length; i < l; i++) {
    violations[i]!.location.reverse();
  }
}

function toAbsoluteURL(url: string, baseURL: string): string {
  return new URL(url, baseURL).toString();
}
