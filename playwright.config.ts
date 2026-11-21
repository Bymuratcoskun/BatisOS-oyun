import { defineConfig, devices } from '@playwright/test';

// Tam oyun testleri DERLENMİŞ paket üzerinde koşar (gösterilen paket = test edilen paket).
// Tarayıcılar headless ve GPU'suz: GPU bu makinede tek sahipli (Genel-Kurallar KOORDINASYON §3);
// operatörün ekranında pencere açılmaz.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4317', headless: true },
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4317 --strictPort',
    url: 'http://127.0.0.1:4317',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { args: ['--disable-gpu', '--use-gl=swiftshader'] } },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: { firefoxUserPrefs: { 'layers.acceleration.disabled': true, 'gfx.webrender.software': true } },
      },
    },
  ],
});
