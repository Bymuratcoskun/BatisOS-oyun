/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
// Sürüm tek yerden: package.json. Oyunda alt satırda görünür (hata bildirimi hangi sürüm olduğunu taşısın).
// import (readFileSync değil): Vite yapılandırmanın içe aktardığı dosyaları izler; package.json değişince
// geliştirme sunucusu kendini yeniden başlatır. readFileSync ile sunucu eski sürümü göstermeye devam ediyordu
// (2026-11-21: ekranda v1.0.0, kod 1.1.0-gelistirme).
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  base: './',
  define: { __SURUM__: JSON.stringify(pkg.version), __OYUN_ADRESI__: JSON.stringify(pkg.homepage) },
  test: {
    include: ['tests/core/**/*.test.ts', 'tests/content/**/*.test.ts'],
    environment: 'node',
  },
});
