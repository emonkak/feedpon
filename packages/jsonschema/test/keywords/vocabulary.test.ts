import testCases from 'json-schema-test-suite/tests/draft2020-12/defs.json' with {
  type: 'json',
};
import { describe } from 'vitest';

for (const testCase of testCases) {
  describe.todo(testCase.description);
}
