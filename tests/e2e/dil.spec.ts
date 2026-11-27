// v1.4 İngilizce ve oyun rehberi — tarayıcıda, gerçek tıklamayla. Ürün sorusu: İngilizce tarayıcıyla gelen
// oyuncu oyunu baştan sona İngilizce oynayabiliyor mu, rehberi okuyabiliyor mu?
// Ölçüt (koşmadan önce yazıldı): İngilizce tarayıcı (en-US) oyunu İngilizce açar, <html lang="en">.
// `#tohum-42` İngilizce, çekirdek + çeviri katmanıyla yan yana oynanır: her hafta başlık, açıklama ve uyarılar
// birebir; takip kartı ve son söz İngilizce. Dil düğmesi oyunun ortasında Türkçeye geçirir, seçim yeniden
// yüklemede hatırlanır. Rehber iki dilde açılır, bölüm sayısı kaynakla aynı, geri dönünce oyun yerinde durur.
// Her ekranda axe-core ihlali 0, 360 px'te yatay taşma 0, konsol hatası 0.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { applyChoice, nextTurn, showResults } from '../../src/core/apply-choice.ts';
import { cardAt, followUpId } from '../../src/core/chains.ts';
import { buildDeck } from '../../src/core/deck.ts';
import { initialState, newGame } from '../../src/core/new-game.ts';
import type { Card, GameState, Option } from '../../src/core/types.ts';
import { POOL } from '../../src/content/pool.ts';
import { rehber } from '../../src/i18n/rehber.ts';
import { ipuclariYerel, kartYerel, sonSozlerYerel } from '../../src/i18n/yerel.ts';
import { must } from '../helpers.ts';

const axe = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations.map(
    (v) => `${v.id} ×${v.nodes.length}: ${v.nodes[0]?.target.join(' ')}`,
  );
const tasma = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const hatalar = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
};

test.describe('İngilizce tarayıcı', () => {
  test.use({ locale: 'en-US' });

  test('oyun baştan sona İngilizce: kartlar, uyarılar, takip kartı ve son söz çekirdekle birebir', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const errors = hatalar(page);
    const seed = 42;
    const r = buildDeck(POOL, seed);
    if (!r.ok) throw new Error(r.reason);
    const deck: readonly Card[] = r.deck;
    let s: GameState = must(newGame(initialState(), seed, deck.map((c) => c.id), true));
    // Seçici zincir.spec ile aynı: 1. hafta altyapı; 9. haftadan sonra bir kez tanıtım; geri kalan müşteri.
    let gecSoz = false;
    const sec = (c: Card, hafta: number): Option => {
      if (hafta === 1) return c.options.find((o) => o.tags.includes('altyapı'))!;
      const t = c.options.find((o) => o.tags.includes('tanıtım'));
      if (hafta >= 9 && !gecSoz && t) return ((gecSoz = true), t);
      return c.options.find((o) => o.tags.length === 0)!;
    };

    await page.goto('about:blank');
    await page.goto(`./#tohum-${seed}`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('button', { name: 'Found the company' }).click();
    let takipGoruldu = false;
    for (let hafta = 1; ; hafta++) {
      const asil = cardAt(s, deck)!;
      const k = kartYerel(asil, s, 'en');
      await expect(page.getByTestId('kart-baslik')).toHaveText(k.title);
      await expect(page.locator('.desc')).toHaveText(k.description);
      for (const o of asil.options) {
        await expect(page.locator(`.option[data-option="${o.id}"] .opt-text`)).toHaveText(k.options.find((x) => x.id === o.id)!.text);
        await expect(page.locator(`.option[data-option="${o.id}"] [data-testid="zincir-uyari"]`)).toHaveText(ipuclariYerel(s, o, 'en'));
      }
      if (hafta === 1) {
        await expect(page.getByTestId('hafta')).toHaveText('Week 1 / 12');
        await expect(page.getByTestId('zincir-uyari').first()).toHaveText('Will need maintenance in 3 weeks.');
        expect(await axe(page)).toEqual([]);
        expect(await tasma(page)).toBeLessThanOrEqual(0);
      }
      if (asil.id === followUpId('bakim')) {
        takipGoruldu = true;
        await expect(page.getByTestId('kart-baslik')).toHaveText('That Thing Is Still Running');
        await expect(page.locator('.desc')).toContainText('Week 1: “');
      }
      const o = sec(asil, hafta);
      await page.locator(`.option[data-option="${o.id}"]`).click();
      s = must(applyChoice(s, deck, asil.id, o.id));
      const next = page.getByRole('button', { name: /^(Next week|See the results)$/ });
      const label = await next.textContent();
      await next.click();
      if (label === 'See the results') break;
      s = must(nextTurn(s, deck));
    }
    s = must(showResults(s));
    expect(takipGoruldu && gecSoz).toBe(true); // tarama boş geçmesin
    await expect(page.getByTestId('bitis-baslik')).toHaveText(/^COMPANY (STILL STANDING|CLOSED)$/);
    const son = sonSozlerYerel(s, 'en');
    expect(son.some((x) => x.endsWith('promise is still out there on the internet. So is the screenshot.'))).toBe(true);
    await expect(page.getByTestId('son-soz').locator('li')).toHaveText(son);
    await expect(page.getByRole('heading', { name: 'DECISION SUMMARY' })).toBeVisible();
    expect(await axe(page)).toEqual([]);
    expect(await tasma(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('dil düğmesi oyunun ortasında Türkçeye geçirir; seçim yeniden yüklemede hatırlanır', async ({ page }) => {
    const errors = hatalar(page);
    await page.goto('about:blank');
    await page.goto('./#tohum-7');
    await page.getByRole('button', { name: 'Found the company' }).click();
    const deck = (buildDeck(POOL, 7) as { deck: Card[] }).deck;
    const s = must(newGame(initialState(), 7, deck.map((c) => c.id), true));
    await expect(page.getByTestId('kart-baslik')).toHaveText(kartYerel(deck[0]!, s, 'en').title);
    await page.getByTestId('dil').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
    await expect(page.getByTestId('kart-baslik')).toHaveText(deck[0]!.title); // aynı kart, Türkçe
    await expect(page.getByTestId('hafta')).toHaveText('Hafta 1 / 12');
    await expect(page.getByTestId('dil')).toHaveText('English');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Şirketi kur' })).toBeVisible();
    await page.goto('./?lang=en#tohum-7'); // adres saklanan seçimi ezer
    await expect(page.getByRole('button', { name: 'Found the company' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('rehber İngilizce açılır, bütün bölümler var; oyun ortasında açılıp kapanınca kart yerinde', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const errors = hatalar(page);
    await page.goto('about:blank');
    await page.goto('./#tohum-9');
    await page.getByRole('button', { name: 'How to play' }).click();
    const g = rehber('en');
    await expect(page.getByTestId('rehber').getByRole('heading', { level: 1 })).toHaveText(g.baslik);
    await expect(page.getByTestId('rehber').getByRole('heading', { level: 2 })).toHaveCount(g.bolumler.length);
    expect(await axe(page)).toEqual([]);
    expect(await tasma(page)).toBeLessThanOrEqual(0);
    await page.getByTestId('rehber-kapat').click();
    await page.getByRole('button', { name: 'Found the company' }).click();
    const baslik = await page.getByTestId('kart-baslik').textContent();
    await page.getByTestId('rehber-alt').click();
    await expect(page.getByTestId('rehber')).toBeVisible();
    await page.getByTestId('rehber-kapat').click();
    await expect(page.getByTestId('kart-baslik')).toHaveText(baslik!);
    expect(page.url()).toContain('#tohum-9'); // içindekiler bağlantıları adresi bozmaz
    expect(errors).toEqual([]);
  });
});

test('Türkçe tarayıcı: oyun Türkçe açılır, rehber Türkçe ve eksiksiz', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('about:blank');
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await page.getByRole('button', { name: 'Nasıl oynanır?' }).click();
  const g = rehber('tr');
  await expect(page.getByTestId('rehber').getByRole('heading', { level: 1 })).toHaveText(g.baslik);
  await expect(page.getByTestId('rehber').getByRole('heading', { level: 2 })).toHaveCount(g.bolumler.length);
  await page.getByTestId('rehber').getByRole('link', { name: g.bolumler.at(-1)!.baslik }).click();
  await expect(page.locator(`#rehber-${g.bolumler.at(-1)!.id}`)).toBeInViewport();
  expect(await axe(page)).toEqual([]);
  expect(await tasma(page)).toBeLessThanOrEqual(0);
});
