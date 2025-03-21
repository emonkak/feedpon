import { describe, expect, test } from 'vitest';

import {
  type Reference,
  ReferenceCollector,
  ValidationEngine,
  type ValidationResult,
} from 'jsonschema';
import {
  type JSONSchema,
  type JSONSchemaVocabulary,
  jsonSchemaTraverser,
  jsonSchemaValidator,
} from 'jsonschema/dialects/2020-12.ts';

export interface TestCase {
  description: string;
  schema: object | boolean;
  tests: TestUnit[];
}

export interface TestUnit {
  description: string;
  data: unknown;
  valid: boolean;
}

export interface ValidateOptions {
  preloadedReferences?: Reference<JSONSchemaVocabulary>[];
}

export function runTestCase(
  testCase: TestCase,
  options: ValidateOptions = {},
): void {
  describe(testCase.description, () => {
    for (const testUnit of testCase.tests) {
      test(testUnit.description, () => {
        if (testUnit.valid) {
          expect(
            validate(testUnit.data, testCase.schema, options),
          ).toStrictEqual({
            valid: true,
            errors: [],
          });
        } else {
          expect(validate(testUnit.data, testCase.schema, options)).not.toBe({
            valid: true,
            errors: [],
          });
        }
      });
    }
  });
}

function validate(
  value: unknown,
  schema: JSONSchema,
  { preloadedReferences = [] }: ValidateOptions,
): ValidationResult<JSONSchemaVocabulary> {
  const validationEngine = new ValidationEngine(jsonSchemaValidator);
  const referenceCollector = new ReferenceCollector(jsonSchemaTraverser);
  const references =
    typeof schema !== 'boolean'
      ? concat(preloadedReferences, referenceCollector.collect(schema))
      : preloadedReferences;
  return validationEngine.validate(value, schema, { references });
}

function* concat<T>(...iterables: Iterable<T>[]): Generator<T> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}
