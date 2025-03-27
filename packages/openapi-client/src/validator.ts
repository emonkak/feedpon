import { JSONSchemaValidator } from 'jsonschema';
import { draft202012 } from 'jsonschema/dialects/draft202012.ts';
import type { JSONSchema, ParseJSONSchema } from 'jsonschema/dialects/typed.ts';

export type SchemaValidator = <
  TSchema extends JSONSchema,
  TDocumentRoot extends object,
>(
  value: unknown,
  schema: TSchema,
  documentRoot: TDocumentRoot,
) => asserts value is ParseJSONSchema<TSchema, TDocumentRoot>;

export const defaultSchemaValidator: SchemaValidator = <
  TSchema extends JSONSchema,
  TDocumentRoot extends object,
>(
  value: unknown,
  schema: TSchema,
  documentRoot: TDocumentRoot,
): asserts value is ParseJSONSchema<TSchema, TDocumentRoot> => {
  const validator = new JSONSchemaValidator(draft202012);
  validator.ensureValid(value, schema, { documentRoot });
};
