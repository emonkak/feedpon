import path from 'node:path';
import { defineProject } from 'vitest/config';

export default defineProject({
  resolve: {
    alias: {
      '@': path.join(__dirname, '/src'),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
  },
});
