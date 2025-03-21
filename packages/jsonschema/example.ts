import { ReferenceCollector, ValidationEngine } from 'jsonschema';
import {
  jsonSchemaTraverser,
  jsonSchemaValidator,
} from 'jsonschema/dialects/2020-12.ts';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://test.json-schema.org/dynamic-resolution-without-bookend/root',
  $ref: 'list',
  $defs: {
    foo: {
      $dynamicAnchor: 'items',
      type: 'string',
    },
    list: {
      $id: 'list',
      type: 'array',
      items: { $dynamicRef: '#items' },
      $defs: {
        items: {
          $comment:
            'This is only needed to give the reference somewhere to resolve to when it behaves like $ref',
          $anchor: 'items',
        },
      },
    },
  },
} as const;
const value = ['foo', 42];

const validationEngine = new ValidationEngine(jsonSchemaValidator);
const referenceCollector = new ReferenceCollector(jsonSchemaTraverser);
const references = [...referenceCollector.collect(schema)];
const result = validationEngine.validate(value, schema, { references });

console.log(JSON.stringify(result, null, 2));
