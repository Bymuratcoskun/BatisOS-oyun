/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  test: {
    include: ['tests/core/**/*.test.ts', 'tests/content/**/*.test.ts'],
    environment: 'node',
  },
});
