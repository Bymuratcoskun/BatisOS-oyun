// Aşama 13 — hedef ortamda kararlılık. Derlenmiş paket üzerinde (playwright.config: build + preview).
//
// Ölçütler (koşmadan önce yazıldı):
// 1. Dış bağlantı yok: tam bir oyun boyunca sayfanın yaptığı her istek 127.0.0.1'e gider.
//    Ayrıca dışarıya giden her istek bilerek kesildiğinde oyun baştan sona oynanır.
//    Dayanak: Kullanilacak_Teknolojiler "sunucu yok"; Aşama 13 "çevrim dışı çalışma iddiası varsa
//    ayrıca sınanmış".
// 2. Art arda yeniden başlatma: 5 oyun üst üste ("Yeniden dene" ve "Suçu teknoloji yığınına at"
//    dönüşümlü); her yeni oyun 100.000 TL / 0 / 80 / Hafta 1 ile başlar, konsol hatası 0.
//    5: tek oyunda olmayan birikme hatasını (günlük, durum) görmek için yeterli; daha fazlası aynı yolu tekrarlar.
// 3. Pencere boyutu oyun ortasında değişince (1920 → 360 → 1366) yatay taşma yok, oyun sürer.
import { expect, test, type Page } from '@playwright/test';
import { EARLY_BUST, WIN } from '../helpers.ts';

function hataTopla(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

async function oyna(page: Page, seq: readonly string[]) {
  for (const id of seq) {
    await page.locator(`.option[data-option="${id}"]`).click();
    const next = page.getByRole('button', { name: /^(Sonraki tur|Sonuçları gör)$/ });
    const label = await next.textContent();
    await next.click();
    if (label === 'Sonuçları gör') return;
  }
}

async function baslangicDegerleri(page: Page) {
  await expect(page.getByTestId('hafta')).toHaveText('Hafta 1 / 12');
  await expect(page.getByTestId('kasa')).toHaveText('100.000 TL');
  await expect(page.getByTestId('musteri')).toHaveText('0 / 10');
  await expect(page.getByTestId('moral')).toHaveText('80 / 100');
}

test('dış bağlantı yok: tam oyunda bütün istekler 127.0.0.1', async ({ page }) => {
  const hostlar = new Set<string>();
  page.on('request', (r) => hostlar.add(new URL(r.url()).host));
  const errors = hataTopla(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await oyna(page, WIN);
  await expect(page.getByTestId('bitis-baslik')).toHaveText('ŞİRKET AYAKTA');
  expect([...hostlar]).toEqual(['127.0.0.1:4317']);
  expect(errors).toEqual([]);
});

test('dışarıya giden her istek kesilince oyun yine baştan sona oynanır', async ({ page }) => {
  const kesilen: string[] = [];
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host === '127.0.0.1') return route.continue();
    kesilen.push(route.request().url());
    return route.abort('internetdisconnected');
  });
  const errors = hataTopla(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await oyna(page, EARLY_BUST);
  await expect(page.getByTestId('bitis-baslik')).toHaveText('ŞİRKET KAPANDI');
  expect(kesilen).toEqual([]);
  expect(errors).toEqual([]);
});

test('art arda 5 oyun: her yeni oyun temiz başlar, hata birikmez', async ({ page }) => {
  const errors = hataTopla(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  for (let i = 0; i < 5; i++) {
    await baslangicDegerleri(page);
    await expect(page.locator('.log li')).toHaveCount(i % 2 === 0 ? 0 : 1); // "Suçu…" sonrası tek not
    await oyna(page, i % 2 === 0 ? EARLY_BUST : WIN);
    await expect(page.getByTestId('bitis-baslik')).toBeVisible();
    // Çift turda "Yeniden dene", tek turda "Suçu teknoloji yığınına at" (sonraki oyunun günlüğünde not).
    const dugme = i % 2 === 0 ? 'Suçu teknoloji yığınına at' : 'Yeniden dene';
    await page.getByRole('button', { name: dugme }).click();
  }
  expect(errors).toEqual([]);
});

test('oyun ortasında pencere boyutu değişir (1920 → 360 → 1366): taşma yok, oyun sürer', async ({ page }) => {
  const tasma = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await oyna(page, WIN.slice(0, 3));
  for (const [w, h] of [[360, 640], [1366, 768]] as const) {
    await page.setViewportSize({ width: w, height: h });
    expect(await tasma()).toBeLessThanOrEqual(0);
    await expect(page.locator('.option').first()).toBeVisible();
  }
  await oyna(page, WIN.slice(3));
  await expect(page.getByTestId('bitis-baslik')).toHaveText('ŞİRKET AYAKTA');
});
