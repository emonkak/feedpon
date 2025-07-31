import testCases from 'json-schema-test-suite/tests/draft2020-12/defs.json' with {
  type: 'json',
};
import { describe } from 'vitest';

import { runTestCase } from '../testRunner.ts';

for (const testCase of testCases) {
  if (testCase.description === 'validate definition against metaschema') {
    describe.todo(testCase.description);
  } else {
    runTestCase(testCase);
  }
}
