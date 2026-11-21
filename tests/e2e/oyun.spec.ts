// Tam oyun — tarayıcıda gerçek tıklama ve tuşla. "Oyuncu bunu yapabilir mi?" sorusunun kapısı.
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { CARD_SET_VERSION } from '../../src/content/cards.ts';
import { POOL_VERSION } from '../../src/content/pool.ts';
import { EARLY_BUST, WIN } from '../helpers.ts';

const kasa = (p: Page) => p.getByTestId('kasa');

async function start(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('./#klasik');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  return errors;
}

async function clickThrough(page: Page, seq: readonly string[]) {
  for (const id of seq) {
    await page.locator(`.option[data-option="${id}"]`).click();
    const next = page.getByRole('button', { name: /^(Sonraki hafta|Sonuçları gör)$/ });
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
  await expect(page.getByTestId('sinir-notu')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sonraki hafta' }).click();
  await page.locator('.option[data-option="ode"]').click();
  await page.getByRole('button', { name: 'Sonraki hafta' }).click();
  await page.locator('.option[data-option="rust"]').click();
  const deltas = page.getByTestId('degisimler');
  await expect(deltas).toContainText('95 → 100');
  await expect(deltas).toContainText('▲ +5');
  // v1.2 (YZ2): seçenek +20 yazıyordu; kesildiği söylenir. Sınırda olmayan kararda not çıkmaz (ilk karar, 80 → 95).
  await expect(page.getByTestId('sinir-notu')).toContainText('(sınır 100)');
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
  // v1.2 (YZ2): "hafta" ve kazanınca "Son imza"
  await expect(page.locator('.report')).toContainText('Dayanılan süre12 hafta');
  await expect(page.locator('.report')).toContainText('Son imza');
  await expect(page.locator('.report')).not.toContainText('Son harcama');
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
  await expect(page.locator('.report')).toContainText('Son harcama'); // kaybedince başlık değişmez (v1.2)
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
  await page.goto('./#klasik');
  await expect(page.getByTestId('surum')).toHaveText(`v${surum} · ${CARD_SET_VERSION} · klasik`);
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await expect(page.getByTestId('surum')).toHaveText(`v${surum} · ${CARD_SET_VERSION} · klasik`);
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
      await page.getByRole('button', { name: /^(Sonraki hafta|Sonuçları gör)$/ }).click();
    }
    return out;
  };
  await page.goto('./#klasik');
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
  expect(pano).toMatch(/Sen de batır: https:\/\/\S+\/#klasik$/); // v1.2: bağlantı desteyi taşır
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

// v1.2 (K18): varsayılan adres havuzdan deste kurar. Ölçüt: oyun sonuna kadar oynanır (12 hafta ya da batış),
// alt satırda havuz sürümü yazar, ve iki oyunun kart dizisi farklıdır (aynı deste gelme olasılığı ihmal edilebilir).
test('havuz destesi (varsayılan): oyun sonuna kadar oynanır, desteler oyundan oyuna değişir', async ({ page }) => {
  const surum = (JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string }).version;
  const errors = await (async () => {
    const e: string[] = [];
    page.on('pageerror', (x) => e.push(x.message));
    page.on('console', (m) => { if (m.type() === 'error') e.push(m.text()); });
    return e;
  })();
  const oyunOyna = async () => {
    const basliklar: string[] = [];
    for (let i = 0; i < 12; i++) {
      basliklar.push((await page.getByTestId('kart-baslik').textContent()) ?? '');
      await page.locator('.option').first().click();
      const next = page.getByRole('button', { name: /^(Sonraki hafta|Sonuçları gör)$/ });
      const label = await next.textContent();
      await next.click();
      if (label === 'Sonuçları gör') break;
    }
    await expect(page.getByTestId('bitis-baslik')).toBeVisible();
    return basliklar;
  };
  await page.goto('./');
  await expect(page.getByTestId('surum')).toHaveText(`v${surum} · ${POOL_VERSION}`);
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await expect(page.getByTestId('hafta')).toHaveText('Hafta 1 / 12');
  const birinci = await oyunOyna();
  await page.getByRole('button', { name: 'Yeniden dene' }).click();
  await expect(page.getByTestId('kasa')).toHaveText('100.000 TL');
  const ikinci = await oyunOyna();
  expect(birinci).not.toEqual(ikinci);
  expect(errors).toEqual([]);
});

// v1.2 (K20) — bağlantıyla aynı deste. Ölçüt: `#tohum-N` ile açılan oyunun 12 kartı ve her kartın seçenek
// sırası, aynı tohumdan çekirdeğin kurduğu desteyle birebir; iki ayrı açılışta da aynı. Alt satırda tohum yazar.
test('#tohum-N: aynı bağlantı aynı desteyi ve aynı seçenek sırasını açar', async ({ page }) => {
  const { buildDeck } = await import('../../src/core/deck.ts');
  const { POOL } = await import('../../src/content/pool.ts');
  const { optionOrder } = await import('../../src/core/option-order.ts');
  const seed = 42; // havuz denge testinin ölçtüğü 0..99 aralığında: müşteri odaklı bu destede kazanıyor
  const r = buildDeck(POOL, seed);
  if (!r.ok) throw new Error(r.reason);
  const oyna = async () => {
    await page.goto('about:blank');
    await page.goto(`./#tohum-${seed}`);
    await page.getByRole('button', { name: 'Şirketi kur' }).click();
    await expect(page.getByTestId('surum')).toContainText(`tohum ${seed}`);
    const gorulen: string[] = [];
    for (let i = 0; i < 12; i++) {
      const kart = r.deck[i]!;
      await expect(page.getByTestId('kart-baslik')).toHaveText(kart.title);
      const sira = await page.locator('.option').evaluateAll((bs) => bs.map((b) => (b as HTMLElement).dataset['option']));
      expect(sira).toEqual(optionOrder(seed, i).map((k) => kart.options[k]!.id));
      gorulen.push(`${kart.id}:${sira.join(',')}`);
      // Müşteri getiren seçeneği seç ki oyun 12 haftayı bitirsin (havuz denge testi: müşteri odaklı her destede kazanır).
      const enIyi = kart.options.reduce((b, o) => (o.effects.customers > b.effects.customers ? o : b));
      await page.locator(`.option[data-option="${enIyi.id}"]`).click();
      await page.getByRole('button', { name: /^(Sonraki hafta|Sonuçları gör)$/ }).click();
    }
    await expect(page.getByTestId('bitis-baslik')).toHaveText('ŞİRKET AYAKTA');
    return gorulen;
  };
  expect(await oyna()).toEqual(await oyna());
});

test('bozuk tohum: uyarı gösterilir, oyun rastgele desteyle açılır', async ({ page }) => {
  await page.goto('./#tohum-abc');
  await expect(page.getByTestId('uyari')).toHaveText('Bağlantıdaki tohum geçersiz ("abc"); rastgele bir deste açıldı.');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await expect(page.getByTestId('hafta')).toHaveText('Hafta 1 / 12');
});

// v1.2 (K20) — yerel kayıt: biten her oyun bir kez sayılır; depo kapalıysa oyun çökmez, "saklamıyor" der.
test('yerel kayıt: iki oyun sayılır, kazanma ve en iyi kasa', async ({ page }) => {
  await start(page);
  await clickThrough(page, EARLY_BUST);
  await expect(page.getByTestId('kayit')).toHaveText('Bu tarayıcıda: 1 oyun, 0 kazanma · henüz kazanılmış oyun yok.');
  await page.getByRole('button', { name: 'Yeniden dene' }).click();
  await clickThrough(page, WIN);
  await expect(page.getByTestId('kayit')).toHaveText('Bu tarayıcıda: 2 oyun, 1 kazanma · en iyi kasa 73.700 TL.');
  await page.reload(); // kayıt sayfa yenilenince de durur
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await clickThrough(page, EARLY_BUST);
  await expect(page.getByTestId('kayit')).toHaveText('Bu tarayıcıda: 3 oyun, 1 kazanma · en iyi kasa 73.700 TL.');
});

test('yerel kayıt: depo kapalıysa oyun çökmez, saklamadığını söyler', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('engelli'); }, configurable: true });
  });
  const errors = await start(page);
  await clickThrough(page, EARLY_BUST);
  await expect(page.getByTestId('kayit')).toHaveText('Bu tarayıcı sonuç saklamıyor (özel pencere ya da engellenmiş site verisi).');
  expect(errors).toEqual([]);
});
