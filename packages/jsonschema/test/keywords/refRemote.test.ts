import { describe } from 'vitest';

import testCases from 'json-schema-test-suite/tests/draft2020-12/refRemote.json' assert {
  type: 'json',
};

for (const testCase of testCases) {
  describe.todo(testCase.description);
}
