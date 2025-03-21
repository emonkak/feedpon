import detachedDynamicRef from 'json-schema-test-suite/remotes/draft2020-12/detached-dynamicref.json' assert {
  type: 'json',
};
import extendibleDynamicRef from 'json-schema-test-suite/remotes/draft2020-12/extendible-dynamic-ref.json' assert {
  type: 'json',
};
import tree from 'json-schema-test-suite/remotes/draft2020-12/tree.json' assert {
  type: 'json',
};
import testCases from 'json-schema-test-suite/tests/draft2020-12/dynamicRef.json' assert {
  type: 'json',
};
import type { JSONSchemaVocabulary } from '../../src/dialects/2020-12.ts';
import { runTestCase } from '../testRunner.ts';

const preloadedReferences = [
  {
    schema: extendibleDynamicRef as JSONSchemaVocabulary,
    scope: extendibleDynamicRef,
    url: new URL(
      'http://localhost:1234/draft2020-12/extendible-dynamic-ref.json',
    ),
  },
  {
    schema: detachedDynamicRef as JSONSchemaVocabulary,
    scope: detachedDynamicRef,
    url: new URL('http://localhost:1234/draft2020-12/detached-dynamicref.json'),
  },
  {
    schema: tree as JSONSchemaVocabulary,
    scope: tree,
    url: new URL('http://localhost:1234/draft2020-12/tree.json'),
  },
];

for (const testCase of testCases) {
  runTestCase(testCase, {
    preloadedReferences,
  });
}
