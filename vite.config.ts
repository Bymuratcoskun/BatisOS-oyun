/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// Sürüm tek yerden: package.json. Oyunda alt satırda görünür (hata bildirimi hangi sürüm olduğunu taşısın).
const surum = (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }).version;

export default defineConfig({
  base: './',
  define: { __SURUM__: JSON.stringify(surum) },
  test: {
    include: ['tests/core/**/*.test.ts', 'tests/content/**/*.test.ts'],
    environment: 'node',
  },
});
