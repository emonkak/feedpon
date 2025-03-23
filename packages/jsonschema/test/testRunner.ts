import { describe, expect, test } from 'vitest';

import {
  JSONSchemaValidator,
  type ValidationOptions,
  type ValidationResult,
} from 'jsonschema';
import {
  type JSONSchema,
  type JSONSchemaVocabulary,
  draft202012,
} from 'jsonschema/dialects/draft202012.ts';

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

export function runTestCase(
  testCase: TestCase,
  options: ValidationOptions<JSONSchemaVocabulary> = {},
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
  options: ValidationOptions<JSONSchemaVocabulary>,
): ValidationResult<JSONSchemaVocabulary> {
  const validator = new JSONSchemaValidator(draft202012);
  return validator.validate(value, schema, {
    enableStaticReference: true,
    ...options,
  });
}
