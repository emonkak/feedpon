import { JSONSchemaValidator } from 'jsonschema';
import {
  draft202012,
  type JSONSchemaVocabulary,
} from 'jsonschema/dialects/draft202012.ts';

const preloadedReferences = [
  {
    schema: {
      $id: 'http://localhost:1234/draft2020-12/detached-dynamicref.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $defs: {
        foo: {
          $dynamicRef: '#detached',
        },
        detached: {
          $dynamicAnchor: 'detached',
          type: 'integer',
        },
      },
    } as JSONSchemaVocabulary,
    url: 'http://localhost:1234/draft2020-12/detached-dynamicref.json',
  },
];
const testSuits = [
  {
    schema: {
      $ref: 'item',
      $defs: {
        content: {
          $dynamicAnchor: 'content',
          type: 'string',
        },
        item: {
          $id: 'item',
          $dynamicRef: '#content',
          $defs: {
            defaultContent: {
              $dynamicAnchor: 'content',
              type: 'integer',
            },
          },
        },
      },
    },
    tests: [{ data: '123', valid: true }],
  },
  {
    schema: {
      $ref: 'associative-array',
      $defs: {
        key: {
          $dynamicAnchor: 'TKey',
          type: 'string',
        },
        value: {
          $dynamicAnchor: 'TValue',
          type: 'number',
        },
        associativeArray: {
          $id: 'associative-array',
          $defs: {
            key: {
              $dynamicAnchor: 'TKey',
              not: true,
            },
            value: {
              $dynamicAnchor: 'TValue',
              not: true,
            },
          },
          type: 'array',
          items: {
            type: 'array',
            prefixItems: [
              {
                $dynamicRef: '#TKey',
              },
              {
                $dynamicRef: '#TValue',
              },
            ],
          },
        },
      },
    },
    tests: [
      {
        description: 'An array of tuples of string and number is valid',
        data: [['foo', 123]],
        valid: true,
      },
    ],
  },
  {
    description:
      'A $dynamicRef with a non-matching $dynamicAnchor in the same schema resource behaves like a normal $ref to $anchor',
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'https://test.json-schema.org/unmatched-dynamic-anchor/root',
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
              $dynamicAnchor: 'foo',
            },
          },
        },
      },
    },
    tests: [
      {
        description: 'Any array is valid',
        data: ['foo', 42],
        valid: true,
      },
    ],
  },
  {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'https://test.json-schema.org/dynamic-resolution-ignores-anchors/root',
      $ref: 'list',
      $defs: {
        foo: {
          $anchor: 'items',
          type: 'string',
        },
        list: {
          $id: 'list',
          type: 'array',
          items: { $dynamicRef: '#items' },
          $defs: {
            items: {
              $comment:
                'This is only needed to satisfy the bookending requirement',
              $dynamicAnchor: 'items',
            },
          },
        },
      },
    },
    tests: [{ data: ['foo', 42], valid: true }],
  },
  {
    schema: {
      $ref: 'http://localhost:1234/draft2020-12/detached-dynamicref.json#/$defs/foo',
    },
    tests: [{ data: 123, valid: true }],
  },
  {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $ref: '#/$defs/bool',
      $defs: {
        bool: true,
      },
    },
    tests: [{ data: 'foo', valid: true }],
  },
] as const;

outer: for (const { schema, tests } of testSuits) {
  for (const { data, valid } of tests) {
    const validator = new JSONSchemaValidator(draft202012);
    const result = validator.validate(data, schema, {
      enableStaticReference: true,
      preloadedReferences,
    });

    if (result.valid !== valid) {
      console.log(JSON.stringify(result.errors, null, 2));
      break outer;
    }
  }
}
