import { describe } from 'vitest';

import testCases from 'json-schema-test-suite/tests/draft2020-12/defs.json' assert {
  type: 'json',
};
import { runTestCase } from '../testRunner.ts';

for (const testCase of testCases) {
  if (testCase.description === 'validate definition against metaschema') {
    describe.todo(testCase.description);
  } else {
    runTestCase(testCase);
  }
}
