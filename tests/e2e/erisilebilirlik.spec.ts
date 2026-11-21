// Aşama 6 — kullanılabilirlik ve erişilebilirlik. README "Erişilebilirlik hedefleri"ni ölçer.
//
// Ölçütler (koşmadan önce yazıldı):
// 1. Taşma: her ekran boyutunda ve her görünümde yatay kaydırma yok
//    (documentElement.scrollWidth <= innerWidth) ve görünen her düğme ekranın içinde.
//    Eşik 0 px: yatay taşma, Aşama 6'nın "metin taşmaları temel işlemleri engellemiyor" ölçütünün
//    doğrudan ihlali. Ekranlar: demo çözünürlüğü bilinmiyor (Aşama 0 açık), bu yüzden yaygın dizüstü
//    ve projektör boyutları (1024×768, 1280×720, 1366×768, 1920×1080) + en dar yaygın telefon (360×640).
// 2. Uzun metin: kart başlığı, açıklaması ve günlük metni yapay olarak uzatılınca (bölünmez uzun
//    sözcük dahil) taşma yok ve seçenekler tıklanabilir.
// 3. Odak: Tab ile gelinen düğmenin çizgisi (outline) görünür.
// 4. axe-core (WCAG 2.0/2.1 A ve AA kuralları): her görünümde ihlal 0. Eşik 0: README "Test edilmeden
//    uyumluluk iddia edilmez" diyor; ölçülen her ihlal adıyla görülmeli.
// 5. Değişimler yalnız renkle değil: sonuç tablosunda ▲/▼/= işareti ve metin var.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { EARLY_BUST } from '../helpers.ts';

const EKRANLAR = [
  { ad: '1024x768', width: 1024, height: 768 },
  { ad: '1280x720', width: 1280, height: 720 },
  { ad: '1366x768', width: 1366, height: 768 },
  { ad: '1920x1080', width: 1920, height: 1080 },
  { ad: '360x640', width: 360, height: 640 },
] as const;

/** Yatay taşma ve ekran dışında kalan düğmeler; boş dizi = temiz. */
async function tasmalar(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const w = window.innerWidth;
    const sw = document.documentElement.scrollWidth;
    if (sw > w) out.push(`yatay kaydırma: scrollWidth=${sw} > innerWidth=${w}`);
    for (const b of Array.from(document.querySelectorAll('button'))) {
      const r = b.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.left < 0 || r.right > w + 0.5) out.push(`düğme ekran dışında: "${b.textContent?.slice(0, 30)}" [${r.left.toFixed(0)}, ${r.right.toFixed(0)}] w=${w}`);
      if (b.scrollWidth > b.clientWidth + 1) out.push(`düğme içeriği kırpılıyor: "${b.textContent?.slice(0, 30)}"`);
    }
    return out;
  });
}

async function axeIhlalleri(page: Page): Promise<string[]> {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes[0]?.target.join(' ')}`);
}

/** Dört görünümün her birinde ölçüm fonksiyonunu çağırır. */
async function herGorunumde(page: Page, olc: (gorunum: string) => Promise<void>) {
  await page.goto('/');
  await olc('başlangıç');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await olc('karar');
  for (const [i, id] of EARLY_BUST.entries()) {
    await page.locator(`.option[data-option="${id}"]`).click();
    if (i === 0) await olc('karar sonucu');
    const next = page.getByRole('button', { name: /^(Sonraki tur|Sonuçları gör)$/ });
    const label = await next.textContent();
    await next.click();
    if (label === 'Sonuçları gör') break;
  }
  await expect(page.getByTestId('bitis-baslik')).toBeVisible();
  await olc('oyun sonu');
}

for (const e of EKRANLAR) {
  test(`taşma yok — ${e.ad}`, async ({ page }) => {
    await page.setViewportSize({ width: e.width, height: e.height });
    const bulgular: string[] = [];
    await herGorunumde(page, async (g) => {
      for (const t of await tasmalar(page)) bulgular.push(`${g}: ${t}`);
    });
    expect(bulgular).toEqual([]);
  });
}

test('axe-core: dört görünümde WCAG A/AA ihlali yok', async ({ page }) => {
  const bulgular: string[] = [];
  await herGorunumde(page, async (g) => {
    for (const v of await axeIhlalleri(page)) bulgular.push(`${g}: ${v}`);
  });
  expect(bulgular).toEqual([]);
});

test('uzun metin seçenekleri ve göstergeleri erişilemez yapmıyor (360x640)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  const uzun = 'Ekip toplantısı uzadıkça uzadı ve gündem maddeleri çoğaldı. '.repeat(8);
  const bolunmez = 'Kendiyazdığımızdosyabiçimistandardıçekirdekmotoru'.repeat(2);
  await page.evaluate(
    ([u, b]) => {
      document.querySelector('[data-testid="kart-baslik"]')!.textContent = `${b} ${u.slice(0, 120)}`;
      document.querySelector('.desc')!.textContent = u;
      const opt = document.querySelector('.option .opt-text')!;
      opt.textContent = 'Altyapıyı bir kez daha, bu sefer gerçekten temiz yazalım'; // 57 karakter: kart sınırı 60
    },
    [uzun, bolunmez] as const,
  );
  expect(await tasmalar(page)).toEqual([]);
  // Göstergeler hâlâ görünür, seçenek hâlâ tıklanabilir.
  await expect(page.getByTestId('kasa')).toBeVisible();
  await page.locator('.option').first().click();
  const sonuc = page.getByTestId('sonuc-metni');
  await sonuc.evaluate((el, u) => (el.textContent = u), `${bolunmez} ${uzun}`);
  expect(await tasmalar(page)).toEqual([]);
  await expect(page.getByRole('button', { name: 'Sonraki tur' })).toBeVisible();
});

test('odak görünür: Tab ile gelinen düğmenin çizgisi var', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveText('Şirketi kur');
  const outline = await focused.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
  });
  expect(outline.style).not.toBe('none');
  expect(outline.width).toBeGreaterThanOrEqual(2);
});

test('değişimler yalnız renkle anlatılmıyor: işaret ve metin var', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await page.locator('.option[data-option="bicim"]').click(); // kasa −, müşteri 0, moral +
  const t = page.getByTestId('degisimler');
  await expect(t).toContainText('▼');
  await expect(t).toContainText('Değişmedi');
  await expect(t).toContainText('▲');
});
