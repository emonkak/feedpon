import testCases from 'json-schema-test-suite/tests/draft2020-12/ref.json' with {
  type: 'json',
};
import { describe } from 'vitest';

import { runTestCase } from '../testRunner.ts';

for (const testCase of testCases) {
  if (testCase.description === 'remote ref, containing refs itself') {
    describe.todo(testCase.description);
  } else {
    runTestCase(testCase);
  }
}
