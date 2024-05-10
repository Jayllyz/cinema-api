/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    maxWorkers: 1,
    minWorkers: 1,
  },
});
