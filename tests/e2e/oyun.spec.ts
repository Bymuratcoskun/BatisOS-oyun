// Tam oyun — tarayıcıda gerçek tıklama ve tuşla. "Oyuncu bunu yapabilir mi?" sorusunun kapısı.
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { CARD_SET_VERSION } from '../../src/content/cards.ts';
import { EARLY_BUST, WIN } from '../helpers.ts';

const kasa = (p: Page) => p.getByTestId('kasa');

async function start(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  return errors;
}

async function clickThrough(page: Page, seq: readonly string[]) {
  for (const id of seq) {
    await page.locator(`.option[data-option="${id}"]`).click();
    const next = page.getByRole('button', { name: /^(Sonraki tur|Sonuçları gör)$/ });
    const label = await next.textContent();
    await next.click();
    if (label === 'Sonuçları gör') return;
  }
}

test('başlangıç değerleri ve seçim öncesi görünen etkiler', async ({ page }) => {
  const errors = await start(page);
  await expect(page.getByTestId('hafta')).toHaveText('Hafta 1 / 12');
  await expect(kasa(page)).toHaveText('100.000 TL');
  await expect(page.getByTestId('musteri')).toHaveText('0 / 10');
  await expect(page.getByTestId('moral')).toHaveText('80 / 100');
  await expect(page.getByTestId('kart-baslik')).toHaveText('İlk müşteri kapıda');
  await expect(page.locator('.option[data-option="csv"]')).toContainText('Kasa −5.000 TL');
  await expect(page.locator('.option[data-option="csv"]')).toContainText('Müşteri +3');
  expect(errors).toEqual([]);
});

test('çift tıklama kararı iki kez işlemez', async ({ page }) => {
  await start(page);
  await page.locator('.option[data-option="csv"]').dblclick();
  await expect(kasa(page)).toHaveText('95.000 TL');
  await expect(page.getByTestId('gunluk').locator('li')).toHaveCount(1);
});

test('sonuç ekranı sınır uygulanmış gerçek değişimi gösterir (95 + 20 → 100, ▲ +5)', async ({ page }) => {
  await start(page);
  await page.locator('.option[data-option="bicim"]').click();
  await expect(page.getByTestId('degisimler')).toContainText('80 → 95');
  await page.getByRole('button', { name: 'Sonraki tur' }).click();
  await page.locator('.option[data-option="ode"]').click();
  await page.getByRole('button', { name: 'Sonraki tur' }).click();
  await page.locator('.option[data-option="rust"]').click();
  const deltas = page.getByTestId('degisimler');
  await expect(deltas).toContainText('95 → 100');
  await expect(deltas).toContainText('▲ +5');
  await expect(page.getByTestId('sonuc-metni')).toHaveText('Pazar payımız değişmedi. Derleyici artık bizi daha iyi anlıyor.');
});

test('kazanan dizi yalnız klavyeyle oynanır → İstemeden CEO', async ({ page }) => {
  const errors = await start(page);
  for (const id of WIN) {
    const key = await page.locator(`.option[data-option="${id}"]`).getAttribute('aria-keyshortcuts');
    await page.keyboard.press(key!);
    await page.keyboard.press('Tab'); // odak başlıktan tek düğmeye
    await page.keyboard.press('Enter');
  }
  await expect(page.getByTestId('bitis-baslik')).toHaveText('ŞİRKET AYAKTA');
  await expect(page.getByTestId('son-kasa')).toHaveText('73.700 TL');
  // Özetin son satırı "Kalan kasa" ile aynı; satır sayısı = başlangıç + 12 karar.
  await expect(page.getByTestId('karar-ozeti').locator('tbody tr')).toHaveCount(13);
  await expect(page.getByTestId('karar-ozeti').locator('tbody tr').last().locator('td').nth(3)).toHaveText('73.700 TL');
  await expect(page.getByTestId('son-musteri')).toHaveText('22');
  await expect(page.getByTestId('unvanlar')).toContainText('İstemeden CEO');
  // oyun bittikten sonra karar düğmesi yok
  await expect(page.locator('.option')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('erken batış → 5. haftada kapanış, iki unvan, “Suçu teknoloji yığınına at”', async ({ page }) => {
  await start(page);
  await clickThrough(page, EARLY_BUST);
  await expect(page.getByTestId('bitis-baslik')).toHaveText('ŞİRKET KAPANDI');
  await expect(page.getByTestId('bitis-nedeni')).toHaveText('Şirketiniz 5. haftada kapandı: kasa tükendi.');
  await expect(page.getByTestId('son-kasa')).toHaveText('−10.000 TL');
  const unvan = page.getByTestId('unvanlar');
  await expect(unvan).toContainText('Mimar Sinan, Gelir Sıfır');
  await expect(unvan).toContainText('Açık Kaynak Fedaisi');
  await expect(page.getByText('“Keşke bir kere para almayı deneseydiniz.”')).toBeVisible();
  // v1.1 karar özeti: harcama ve kalan kasa (yol haritası önerisi §5'teki beş haftalık örnek).
  const ozet = page.getByTestId('karar-ozeti').locator('tbody tr');
  await expect(ozet).toHaveCount(6);
  await expect(ozet.locator('td:nth-child(4)')).toHaveText(['100.000 TL', '70.000 TL', '55.000 TL', '30.000 TL', '8.000 TL', '−10.000 TL']);
  await expect(ozet.locator('td:nth-child(3)')).toHaveText(['', '−30.000 TL', '−15.000 TL', '−25.000 TL', '−22.000 TL', '−18.000 TL']);
  await expect(ozet.locator('td:nth-child(1)')).toHaveText(['—', '1', '2', '3', '4', '5']);

  await page.getByRole('button', { name: 'Suçu teknoloji yığınına at' }).click();
  await expect(page.getByTestId('hafta')).toHaveText('Hafta 1 / 12');
  await expect(kasa(page)).toHaveText('100.000 TL');
  await expect(page.getByTestId('musteri')).toHaveText('0 / 10');
  await expect(page.getByTestId('moral')).toHaveText('80 / 100');
  await expect(page.getByTestId('gunluk')).toHaveText(/Sorumluluk devredildi\./);
  await expect(page.getByTestId('gunluk').locator('li')).toHaveCount(1);
});

test('müşteri hedefi kaçar → kaybedilir; “Yeniden dene” günlüğü temizler', async ({ page }) => {
  await start(page);
  await clickThrough(page, ['csv', 'ode', 'konus', 'ertele', 'odeme-sayfasi', 'discord', 'sunum', 'model', 'duzelt', 'cati', 'belge', 'video']);
  await expect(page.getByTestId('bitis-baslik')).toHaveText('ŞİRKET KAPANDI');
  await expect(page.getByTestId('bitis-nedeni')).toContainText('yalnız 9 ödeme yapan müşteriniz var; hedef 10');
  await page.getByRole('button', { name: 'Yeniden dene' }).click();
  await expect(kasa(page)).toHaveText('100.000 TL');
  await expect(page.getByTestId('gunluk')).toHaveCount(0);
});

test('alt satırda sürüm ve kart seti görünür (package.json + CARD_SET_VERSION, elle yazılmaz)', async ({ page }) => {
  const surum = (JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string }).version;
  await page.goto('./');
  await expect(page.getByTestId('surum')).toHaveText(`v${surum} · ${CARD_SET_VERSION}`);
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await expect(page.getByTestId('surum')).toHaveText(`v${surum} · ${CARD_SET_VERSION}`);
});

test('seçenek sırası oyundan oyuna değişir; tuş numarası ekrandaki yerle eşleşir (v1.1)', async ({ page }) => {
  const sira = async () => {
    const out: string[] = [];
    for (const id of EARLY_BUST) {
      const ids = await page.locator('.option').evaluateAll((bs) => bs.map((b) => (b as HTMLElement).dataset['option']));
      const keys = await page.locator('.option').evaluateAll((bs) => bs.map((b) => [b.getAttribute('aria-keyshortcuts'), b.querySelector('.key')?.textContent]));
      expect(keys).toEqual([['1', '1'], ['2', '2'], ['3', '3']]);
      out.push(ids.join(','));
      await page.locator(`.option[data-option="${id}"]`).click();
      await page.getByRole('button', { name: /^(Sonraki tur|Sonuçları gör)$/ }).click();
    }
    return out;
  };
  await page.goto('./');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  const birinci = await sira();
  await page.getByRole('button', { name: 'Yeniden dene' }).click();
  const ikinci = await sira();
  // 5 kartın hepsinde aynı sıra gelme olasılığı (1/6)^5 ≈ 0,013 %; ikisi de rastgele.
  expect(birinci).not.toEqual(ikinci);
});

test('“Sonucu kopyala” panoya sonuç metnini yazar (v1.1)', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Playwright pano okuma iznini yalnız Chromium’da veriyor; yedek yol iki tarayıcıda ayrı test ediliyor');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await start(page);
  await clickThrough(page, EARLY_BUST);
  await page.getByRole('button', { name: 'Sonucu kopyala' }).click();
  await expect(page.getByTestId('kopya-durum')).toHaveText('Sonuç panoya kopyalandı.');
  const pano = await page.evaluate(() => navigator.clipboard.readText());
  expect(pano.split('\n')[1]).toBe('Şirketiniz 5. haftada kapandı: kasa tükendi.');
  expect(pano).toMatch(/^BatışOS v\S+ — ŞİRKET KAPANDI\n/);
  expect(pano).toContain('Kasa −10.000 TL');
  expect(pano).toMatch(/Sen de batır: https:\/\/\S+\/$/);
});

test('kopyalama reddedilirse sessiz geçmez: nedeni söyler, metni seçilebilir gösterir (v1.1)', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('izin yok')) }, configurable: true });
  });
  await start(page);
  await clickThrough(page, EARLY_BUST);
  await page.getByRole('button', { name: 'Sonucu kopyala' }).click();
  await expect(page.getByTestId('kopya-durum')).toContainText('Kopyalanamadı');
  await expect(page.getByTestId('kopya-metni')).toHaveValue(/Şirketiniz 5\. haftada kapandı: kasa tükendi\./);
  await page.getByRole('button', { name: 'Sonucu kopyala' }).click(); // ikinci basış ikinci kutu açmaz
  await expect(page.getByTestId('kopya-metni')).toHaveCount(1);
});
