// v1.3 olay zincirleri — tarayıcıda, gerçek tıklamayla. Ürün sorusu: oyuncu zinciri GÖRÜYOR mu?
// Ölçüt (koşmadan önce yazıldı): `#tohum-42` oyunu tarayıcıda ve çekirdekte aynı kararlarla yan yana oynanır;
// her hafta kart başlığı/açıklaması ve her seçeneğin zincir uyarısı çekirdekle birebir. 1. hafta altyapı →
// uyarı "3 hafta sonra bakım ister." görünür, 4. hafta takip kartı kararı alıntılar. 9. haftadan sonra tanıtım →
// takip kartına yer yok → sonuç ekranında "GERİDE KALANLAR" satırı. Uyarılı karar ekranı ve son söz ekranında
// axe-core ihlali 0, 360 px'te yatay taşma 0.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { applyChoice, nextTurn, showResults } from '../../src/core/apply-choice.ts';
import { cardAt, chainEpilogues, chainHints, followUpId } from '../../src/core/chains.ts';
import { buildDeck } from '../../src/core/deck.ts';
import { initialState, newGame } from '../../src/core/new-game.ts';
import type { Card, GameState, Option } from '../../src/core/types.ts';
import { POOL } from '../../src/content/pool.ts';
import { must } from '../helpers.ts';

const axe = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations.map(
    (v) => `${v.id} ×${v.nodes.length}: ${v.nodes[0]?.target.join(' ')}`,
  );
const tasma = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test('zincir uçtan uca: uyarı görünür, takip kartı kararı alıntılar, geç söz sonuç ekranında kalır', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  const seed = 42;
  const r = buildDeck(POOL, seed);
  if (!r.ok) throw new Error(r.reason);
  const deck: readonly Card[] = r.deck;
  let s: GameState = must(newGame(initialState(), seed, deck.map((c) => c.id), true));

  // Seçici: 1. hafta altyapı; 9. haftadan itibaren ilk tanıtım fırsatı (bir kez); geri kalan etiketsiz (müşteri).
  let gecSoz = false;
  const sec = (c: Card, hafta: number): Option => {
    if (hafta === 1) return c.options.find((o) => o.tags.includes('altyapı'))!;
    const t = c.options.find((o) => o.tags.includes('tanıtım'));
    if (hafta >= 9 && !gecSoz && t) return ((gecSoz = true), t);
    return c.options.find((o) => o.tags.length === 0)!;
  };

  await page.goto('about:blank');
  await page.goto(`./#tohum-${seed}`);
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  let ilkKarar = '';
  for (let hafta = 1; ; hafta++) {
    const k = cardAt(s, deck)!;
    await expect(page.getByTestId('kart-baslik')).toHaveText(k.title);
    await expect(page.locator('.desc')).toHaveText(k.description);
    // Her seçeneğin uyarısı çekirdekle birebir (uyarısız seçenekte uyarı yok).
    for (const o of k.options) {
      await expect(page.locator(`.option[data-option="${o.id}"] [data-testid="zincir-uyari"]`)).toHaveText(chainHints(s, o).map((h) => h.text));
    }
    const o = sec(k, hafta);
    if (hafta === 1) {
      ilkKarar = o.text;
      await expect(page.locator(`.option[data-option="${o.id}"] [data-testid="zincir-uyari"]`)).toHaveText(['3 hafta sonra bakım ister.']);
      expect(await axe(page)).toEqual([]);
      expect(await tasma(page)).toBeLessThanOrEqual(0);
    }
    if (hafta === 4) {
      expect(k.id).toBe(followUpId('bakim'));
      await expect(page.getByTestId('kart-baslik')).toHaveText('O Şey Hâlâ Çalışıyor');
      await expect(page.locator('.desc')).toContainText(`1. hafta: “${ilkKarar.replace(/“/g, '‘').replace(/”/g, '’')}”`);
    }
    await page.locator(`.option[data-option="${o.id}"]`).click();
    s = must(applyChoice(s, deck, k.id, o.id));
    const next = page.getByRole('button', { name: /^(Sonraki hafta|Sonuçları gör)$/ });
    const label = await next.textContent();
    await next.click();
    if (label === 'Sonuçları gör') break;
    s = must(nextTurn(s, deck));
  }
  s = must(showResults(s));
  expect(gecSoz).toBe(true); // seçici gerçekten geç bir söz verdi (test boş geçmesin)
  const beklenen = chainEpilogues(s);
  expect(beklenen.some((x) => x.endsWith('sözü hâlâ internette duruyor. Ekran görüntüsü de.'))).toBe(true);
  await expect(page.getByTestId('son-soz').locator('li')).toHaveText(beklenen);
  expect(await axe(page)).toEqual([]);
  expect(await tasma(page)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test('#klasik zincirsiz: uyarı yok, takip kartı yok, alt satırda zincir sürümü yok', async ({ page }) => {
  await page.goto('about:blank');
  await page.goto('./#klasik');
  await page.getByRole('button', { name: 'Şirketi kur' }).click();
  await expect(page.locator('.option')).toHaveCount(3);
  await expect(page.getByTestId('zincir-uyari')).toHaveCount(0);
  await expect(page.getByTestId('surum')).not.toContainText('zincir');
});
