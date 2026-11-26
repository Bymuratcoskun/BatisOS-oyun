// v1.2 havuz dengesi (K18). Örneklem: 100 sabit deste (tohum 0..99), HER destenin 3^12 dizisi tam sayılır
// (bir deste ~0,2 sn, ölçüldü 2026-11-21). Bu, bütün olası desteleri kapsamaz; "örneklenen deste" raporda yazılır.
//
// Ölçütler (koşmadan önce yazıldı; dayanak README):
// 1. Her deste kazanılabilir ve kasa bitimiyle kaybedilebilir (iki bitiş de en az bir dizide).
// 2. Her destede "müşteri odaklı" (her kartta en çok müşteri getiren) kazanır — oyunun tezi.
// 3. Her destede "altyapı odaklı" (altyapı etiketli seçenek) kasa bitimiyle kaybeder — README SSS.
// 4. Rapor, eşik YOK: deste başına kazanma oranı en az/ortanca/en çok; eksi moral görülen deste sayısı.
//    Eşiğin dayanağı yok (oyuncu oyunları belirleyecek), uydurulmadı.
// 5. Strateji kapısı havuzda: "hep k. düğme" oranı rastgele oyunun ortalamasından en çok 4 SD sapar.
// v1.3: oyun yayındaki hâliyle, ZİNCİRLİ oynanır (ZINCIR=1). Her hafta kart çekirdekten okunur (cardAt):
// takip kartı geldiyse seçenekler onunkidir. v1.2 karşılaştırması: ZINCIR=0 ile aynı test.
import { describe, expect, it } from 'vitest';
import { applyChoice, nextTurn } from '../../src/core/apply-choice.ts';
import { buildDeck } from '../../src/core/deck.ts';
import { cardAt } from '../../src/core/chains.ts';
import { initialState, newGame } from '../../src/core/new-game.ts';
import { optionOrder } from '../../src/core/option-order.ts';
import type { Card, GameState, Option, PoolCard } from '../../src/core/types.ts';
import { POOL, POOL_VERSION } from '../../src/content/pool.ts';
import { must } from '../helpers.ts';

const deste = (seed: number): PoolCard[] => {
  const r = buildDeck(POOL, seed);
  if (!r.ok) throw new Error(r.reason);
  return r.deck;
};
const ZINCIR = process.env['ZINCIR'] !== '0';
const basla = (d: readonly PoolCard[], seed = 1) => must(newGame(initialState(), seed, d.map((c) => c.id), ZINCIR));

/** Her hafta o haftanın kartına (takip kartı olabilir) seçici uygulanır. */
function oyna(d: readonly PoolCard[], sec: (c: Card, hafta: number) => Option, seed = 1): GameState {
  let s = basla(d, seed);
  for (;;) {
    const k = cardAt(s, d)!;
    s = must(applyChoice(s, d, k.id, sec(k, s.turnIndex).id));
    if (s.outcome !== 'ongoing') return s;
    s = must(nextTurn(s, d));
  }
}

function say(d: readonly PoolCard[]) {
  const t = { total: 0, won: 0, cash: 0, missed: 0, minMoral: Infinity };
  const walk = (s: GameState) => {
    const card = cardAt(s, d)!;
    for (const o of card.options) {
      const r = must(applyChoice(s, d, card.id, o.id));
      t.minMoral = Math.min(t.minMoral, r.morale);
      if (r.outcome === 'ongoing') {
        walk(must(nextTurn(r, d)));
        continue;
      }
      const w = 3 ** (d.length - r.decisionHistory.length);
      t.total += w;
      if (r.endReason === 'goals_met') t.won += w;
      else if (r.endReason === 'cash_depleted') t.cash += w;
      else t.missed += w;
    }
  };
  walk(basla(d));
  return t;
}

const enIyi = (puan: (o: Option) => number) => (c: Card) => c.options.reduce((b, o) => (puan(o) > puan(b) ? o : b));

describe(`Havuz dengesi (${POOL_VERSION}${ZINCIR ? ' + zincir' : ''}, 100 deste)`, () => {
  const desteler = Array.from({ length: 100 }, (_, s) => deste(s));
  const sayim = desteler.map(say);
  const oran = sayim.map((t) => t.won / t.total);

  it('her deste: bütün diziler sayıldı; kazanma ve kasa bitimi ulaşılabilir', () => {
    const bozuk = sayim.flatMap((t, s) => (t.total !== 3 ** 12 || t.won === 0 || t.cash === 0 ? [`tohum ${s}: toplam=${t.total} kazanma=${t.won} kasa=${t.cash}`] : []));
    expect(bozuk).toEqual([]);
  });

  it('her destede "müşteri odaklı" kazanır, "altyapı odaklı" kasa bitimiyle kaybeder', () => {
    const bozuk: string[] = [];
    desteler.forEach((d, s) => {
      const m = oyna(d, enIyi((o) => o.effects.customers));
      if (m.outcome !== 'won') bozuk.push(`tohum ${s} müşteri odaklı: ${m.endReason} kasa=${m.cash} müşteri=${m.customers}`);
      const a = oyna(d, enIyi((o) => (o.tags.includes('altyapı') ? 1 : 0)));
      if (a.endReason !== 'cash_depleted') bozuk.push(`tohum ${s} altyapı odaklı: ${a.endReason}`);
    });
    expect(bozuk).toEqual([]);
  });

  it('rapor: kazanma oranı dağılımı ve eksi moral', () => {
    const sirali = [...oran].sort((a, b) => a - b);
    const y = (x: number) => `${(100 * x).toFixed(2)}%`;
    const eksi = sayim.filter((t) => t.minMoral < 0).length;
    console.log(
      `DENGE ${POOL_VERSION}${ZINCIR ? '+zincir' : ''} deste=100 kazanma en_az=${y(sirali[0]!)} ortanca=${y(sirali[50]!)} en_cok=${y(sirali[99]!)} ortalama=${y(oran.reduce((a, b) => a + b) / 100)} | eksi_moral_gorulen_deste=${eksi}/100 en_dusuk_moral=${Math.min(...sayim.map((t) => t.minMoral))}`,
    );
    expect(sirali[0]).toBeGreaterThan(0);
  });

  it('strateji kapısı (havuz): hiçbir düğme konumu rastgele oyundan anlamlı ölçüde iyi ya da kötü değil', () => {
    const p = oran.reduce((a, b) => a + b) / 100;
    const varP = oran.reduce((a, b) => a + (b - p) ** 2, 0) / 99;
    const sd = Math.sqrt((p * (1 - p)) / 1000 + varP / 100); // 1000 oyunluk binom + p'nin 100 desteden kestirim hatası
    const hep = [0, 1, 2].map((k) => {
      let w = 0;
      for (let seed = 0; seed < 1000; seed++) {
        const d = deste(seed);
        if (oyna(d, (c, i) => c.options[optionOrder(seed, i)[k]!]!, seed).outcome === 'won') w++;
      }
      return w / 1000;
    });
    console.log(`DENGE strateji_havuz${ZINCIR ? '+zincir' : ''} tohum=1000 rastgele_ortalama=${(100 * p).toFixed(2)}% esik=±${(400 * sd).toFixed(1)}puan ${hep.map((o, k) => `hep-${k + 1}=${(100 * o).toFixed(1)}%`).join(' ')}`);
    for (const o of hep) expect(Math.abs(o - p)).toBeLessThan(4 * sd);
  });
});
