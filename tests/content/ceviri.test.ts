// v1.4 İngilizce. İki soru ayrı sorulur (CLAUDE.md §2: dosya denetimi ≠ ürün denetimi):
// 1. Veri: her Türkçe metnin İngilizcesi var, fazlası yok, yer tutucular aynı, Türkçe kalan yok.
// 2. Ürün: oyun İngilizce oynanırken ekrana giden HER metin (kart, uyarı, takip kartı, günlük, son söz,
//    unvan, yatırımcı, paylaşım) gerçekten İngilizce mi? Rastgele 2.000 oyunda her adım okunur.
// Ölçüt (koşmadan önce yazıldı): hata listesi boş; ürün taramasında Türkçe harf 0, yer tutucu artığı 0,
// takip kartı tetikleyen kararın İngilizcesini alıntılıyor; negatif kontrollerin her biri adıyla kırmızı.
import { describe, expect, it } from 'vitest';
import { applyChoice, nextTurn, showResults } from '../../src/core/apply-choice.ts';
import { AWARD_IDS, buildReportCard, calculateAwards } from '../../src/core/calculate-awards.ts';
import { cardAt, followUpId } from '../../src/core/chains.ts';
import { buildDeck } from '../../src/core/deck.ts';
import { initialState, newGame } from '../../src/core/new-game.ts';
import { mulberry32 } from '../../src/core/rng.ts';
import { CHAIN_IDS, type Card, type GameState } from '../../src/core/types.ts';
import { CHAIN_TEMPLATES } from '../../src/content/chains.ts';
import { POOL } from '../../src/content/pool.ts';
import { dogrulaIngilizce, TURKCE_HARF } from '../../src/i18n/dogrula.ts';
import { KARTLAR_EN, UNVAN_EN, YATIRIMCI_EN, ZINCIR_EN, type KartEN } from '../../src/i18n/icerik-en.ts';
import { UI } from '../../src/i18n/ui.ts';
import { ipuclariYerel, kararYerel, kartYerel, sonHarcamaYerel, sonSozlerYerel, unvanYerel, yatirimciYerel } from '../../src/i18n/yerel.ts';
import { shareText } from '../../src/ui/render.ts';
import { must } from '../helpers.ts';

const dogrula = (kartlar = KARTLAR_EN, zincirler = ZINCIR_EN, unvanlar = UNVAN_EN) =>
  dogrulaIngilizce(POOL, kartlar, CHAIN_TEMPLATES, zincirler, AWARD_IDS, unvanlar, YATIRIMCI_EN);

/** Ürün denetimi: ekrana giden metinde Türkçe harf ya da doldurulmamış yer tutucu var mı? */
function denetle(out: string[], yer: string, metin: string): void {
  if (TURKCE_HARF.test(metin.replaceAll('BatışOS', ''))) out.push(`${yer}: Türkçe harf: ${metin.slice(0, 60)}`);
  if (/\{\w+\}/.test(metin)) out.push(`${yer}: yer tutucu kaldı: ${metin.slice(0, 60)}`);
}

describe('v1.4 İngilizce içerik (veri)', () => {
  it('her kartın, seçeneğin, takip kartının, unvanın ve yatırımcı yorumunun İngilizcesi tam ve temiz', () => {
    expect(dogrula()).toEqual([]);
  });

  it('negatif kontrol: eksik kart, eksik seçenek, fazla kart, Türkçe kalan, çevrilmemiş, yer tutucu farkı adıyla reddedilir', () => {
    const bozuk: Record<string, KartEN> = structuredClone(KARTLAR_EN);
    delete bozuk['rakip'];
    delete bozuk['logo']!.options['animasyon'];
    bozuk['hayalet'] = bozuk['destek']!;
    bozuk['eklenti']!.options['ertele']!.text = 'Ertele'; // Türkçe harfsiz Türkçe
    bozuk['destek']!.title = 'İlk destek talebi';
    const z = structuredClone(ZINCIR_EN);
    z.teslim.hintSlot = 'You reach customers in {gun} weeks.'; // {esik} düştü
    const u = structuredClone(UNVAN_EN);
    delete u['istemeden-ceo'];
    const e = dogrula(bozuk, z, u).join('\n');
    expect(e).toContain('rakip: İngilizce kart yok');
    expect(e).toContain('logo/animasyon/metin: İngilizcesi yok');
    expect(e).toContain('hayalet: Türkçede olmayan İngilizce kart');
    expect(e).toContain('eklenti/ertele/metin: çevrilmemiş');
    expect(e).toContain('destek/başlık: İngilizce metinde Türkçe harf var');
    expect(e).toContain('teslim/uyarı: yer tutucular farklı');
    expect(e).toContain('unvan istemeden-ceo/ad: İngilizcesi yok');
  });

  it('arayüz metinleri: İngilizcede Türkçe harf yok (marka adı ve "Türkçe" düğmesi dışında)', () => {
    const out: string[] = [];
    for (const [k, v] of Object.entries(UI.en)) {
      if (k === 'dilDugmesi' || k === 'dilDugmesiEtiket') continue;
      const ornek = typeof v === 'function' ? (v as (...a: unknown[]) => string)(1, 2, 'x', 'y', 3) : Array.isArray(v) ? v.join(' ') : v;
      denetle(out, `UI.${k}`, ornek);
    }
    expect(out).toEqual([]);
    expect(Object.keys(UI.en).sort()).toEqual(Object.keys(UI.tr).sort());
  });
});

describe('v1.4 İngilizce oyun (ürün)', () => {
  it('2.000 rastgele zincirli oyunda ekrana giden her İngilizce metin temiz; takip kartı kararın İngilizcesini alıntılar', () => {
    const rnd = mulberry32(20261127);
    const out: string[] = [];
    let takip = 0;
    let sonSoz = 0;
    const gorulenUnvan = new Set<string>();
    for (let g = 0; g < 2000; g++) {
      const seed = Math.floor(rnd() * 2 ** 32);
      const deck: readonly Card[] = (buildDeck(POOL, seed) as { deck: Card[] }).deck;
      let s: GameState = must(newGame(initialState(), seed, deck.map((c) => c.id), true));
      for (;;) {
        const asil = cardAt(s, deck)!;
        const k = kartYerel(asil, s, 'en');
        expect(k.options.map((o) => [o.id, o.effects])).toEqual(asil.options.map((o) => [o.id, o.effects])); // yalnız metin değişir
        denetle(out, `${k.id}/başlık`, k.title);
        denetle(out, `${k.id}/açıklama`, k.description);
        for (const o of asil.options) for (const h of ipuclariYerel(s, o, 'en')) denetle(out, `${k.id}/${o.id}/uyarı`, h);
        for (const o of k.options) denetle(out, `${k.id}/${o.id}`, o.text);
        const z = CHAIN_IDS.find((c) => followUpId(c) === asil.id);
        if (z && z !== 'teslim') {
          takip++;
          const e = s.chains.find((x) => x.chain === z)!;
          const d = s.decisionHistory.find((x) => x.turn === e.turn)!;
          const en = kararYerel(d, s, 'en').text.replace(/“/g, '‘').replace(/”/g, '’');
          expect(k.description).toContain(`“${en}”`);
        }
        const o = asil.options[Math.floor(rnd() * 3)]!;
        s = must(applyChoice(s, deck, asil.id, o.id));
        const son = kararYerel(s.decisionHistory.at(-1)!, s, 'en');
        denetle(out, `${asil.id}/${o.id}/günlük`, son.log);
        if (s.outcome !== 'ongoing') break;
        s = must(nextTurn(s, deck));
      }
      s = must(showResults(s));
      for (const x of sonSozlerYerel(s, 'en')) (sonSoz++, denetle(out, 'son söz', x));
      const r = buildReportCard(s);
      for (const a of calculateAwards(s)) {
        gorulenUnvan.add(a.id);
        const u = unvanYerel(a, 'en');
        denetle(out, `unvan ${a.id}`, `${u.title} ${u.quip}`);
      }
      denetle(out, 'yatırımcı', yatirimciYerel(r, 'en'));
      denetle(out, 'son harcama', sonHarcamaYerel(r, s, 'en') ?? '');
      denetle(out, 'paylaşım', shareText(s, 'havuz', 'en'));
      if (out.length > 20) break;
    }
    expect(out.slice(0, 20)).toEqual([]);
    // Tarama boş geçmesin: takip kartları ve son sözler gerçekten görüldü.
    expect(takip).toBeGreaterThan(500);
    expect(sonSoz).toBeGreaterThan(100);
    expect(gorulenUnvan.size).toBeGreaterThanOrEqual(3);
  });

  it('İngilizce paylaşılan bağlantı ?lang=en taşır; Türkçe bağlantı değişmedi', () => {
    const deck = (buildDeck(POOL, 5) as { deck: Card[] }).deck;
    let s = must(newGame(initialState(), 5, deck.map((c) => c.id), true));
    for (;;) {
      const c = cardAt(s, deck)!;
      s = must(applyChoice(s, deck, c.id, c.options[2]!.id));
      if (s.outcome !== 'ongoing') break;
      s = must(nextTurn(s, deck));
    }
    s = must(showResults(s));
    expect(shareText(s, 'havuz', 'en').split('\n').at(-1)).toMatch(/^Sink yours too: https:\/\/\S+\?lang=en#tohum-5$/);
    expect(shareText(s, 'havuz').split('\n').at(-1)).toMatch(/^Sen de batır: https:\/\/\S+\/#tohum-5$/);
  });
});
