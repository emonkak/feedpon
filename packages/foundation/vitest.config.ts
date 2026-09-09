import path from 'node:path';
import { defineProject } from 'vitest/config';

export default defineProject({
  resolve: {
    alias: {
      '@': path.join(import.meta.dirname, '/src'),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
  },
});
