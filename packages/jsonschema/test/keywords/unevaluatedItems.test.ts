import testCases from 'json-schema-test-suite/tests/draft2020-12/unevaluatedItems.json' with {
  type: 'json',
};

import { runTestCase } from '../testRunner.ts';

for (const testCase of testCases) {
  runTestCase(testCase);
}
