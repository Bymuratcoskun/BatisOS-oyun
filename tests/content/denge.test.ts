// Denge ölçümü — Geliştirme_Asamalari Aşama 4 ve 11.
// 3^12 = 531.441 seçim dizisinin TAMAMI gerçek çekirdekle oynatılır (örneklem değil).
// Batışta kalan turlar oynanamaz; o dal 3^(kalan) dizi olarak sayılır.
// Bu ölçüm "her yol dengeli" demez; yalnız sonuçların dağılımını gösterir.
import { describe, expect, it } from 'vitest';
import { applyChoice, nextTurn } from '../../src/core/apply-choice.ts';
import { calculateAwards } from '../../src/core/calculate-awards.ts';
import { optionOrder } from '../../src/core/option-order.ts';
import type { GameState } from '../../src/core/types.ts';
import { CARDS, CARD_SET_VERSION } from '../../src/content/cards.ts';
import { must, play, started } from '../helpers.ts';

interface Tally {
  total: number;
  won: number;
  cash: number;
  missed: number;
  bustTurn: number[];
  awards: Record<string, number>;
}

function enumerate(): Tally {
  const t: Tally = { total: 0, won: 0, cash: 0, missed: 0, bustTurn: Array(13).fill(0), awards: {} };
  const walk = (s: GameState) => {
    const card = CARDS[s.turnIndex]!;
    for (const o of card.options) {
      const r = must(applyChoice(s, CARDS, card.id, o.id));
      if (r.outcome === 'ongoing') {
        walk(must(nextTurn(r, CARDS)));
        continue;
      }
      const weight = 3 ** (CARDS.length - r.decisionHistory.length);
      t.total += weight;
      if (r.endReason === 'goals_met') t.won += weight;
      if (r.endReason === 'cash_depleted') {
        t.cash += weight;
        t.bustTurn[r.decisionHistory.length]! += weight;
      }
      if (r.endReason === 'customer_target_missed') t.missed += weight;
      for (const a of calculateAwards(r)) t.awards[a.title] = (t.awards[a.title] ?? 0) + weight;
    }
  };
  walk(started());
  return t;
}

/** Aşama 11 senaryoları: her kartta bir kurala göre seçim; eşitlikte ilk seçenek. */
function strategy(score: (o: (typeof CARDS)[number]['options'][number]) => number): string[] {
  return CARDS.map((c) => c.options.reduce((best, o) => (score(o) > score(best) ? o : best)).id);
}

const pct = (n: number, d: number) => `${((100 * n) / d).toFixed(2)}%`;

describe(`Denge (${CARD_SET_VERSION})`, () => {
  const t = enumerate();

  it('bütün diziler sayıldı', () => {
    expect(t.total).toBe(3 ** 12);
    expect(t.won + t.cash + t.missed).toBe(t.total);
  });

  it('üç bitiş türünün üçü de ulaşılabilir', () => {
    expect(t.won).toBeGreaterThan(0);
    expect(t.cash).toBeGreaterThan(0);
    expect(t.missed).toBeGreaterThan(0);
  });

  it('dört unvanın dördü de en az bir dizide çıkıyor', () => {
    expect(Object.keys(t.awards).sort()).toEqual(['Açık Kaynak Fedaisi', 'Mimar Sinan, Gelir Sıfır', 'Sunum Unicorn’u', 'İstemeden CEO'].sort());
  });

  // Strateji kapısı (v1.1, K14). Ölçüt koşmadan önce yazıldı:
  // Sıra rastgeleyse "hep k. düğme" her kartta rastgele bir seçenek seçmekle aynıdır; yani kazanma oranı
  // rastgele oyunun oranına (t.won / t.total) eşit OLMALI — düğmenin yeri bilgi taşımamalı.
  // 1000 sabit tohum (0..999): binom SD = √(p(1−p)/1000) ≈ 1,2 puan; eşik 4 SD.
  // v1.0'da (sabit sıra) "hep 1" %100 kazanıyordu; kapı bunu kırmızı verir.
  it('strateji kapısı: hiçbir düğme konumu rastgele oyundan anlamlı ölçüde iyi ya da kötü değil', () => {
    const p = t.won / t.total;
    const sd = Math.sqrt((p * (1 - p)) / 1000);
    const oranlar = [0, 1, 2].map((k) => {
      let kazanan = 0;
      for (let seed = 0; seed < 1000; seed++) {
        const seq = CARDS.map((c, i) => c.options[optionOrder(seed, i)[k]!]!.id);
        if (play(CARDS, seq).outcome === 'won') kazanan++;
      }
      return kazanan / 1000;
    });
    const sabit = [0, 1, 2].map((k) => play(CARDS, CARDS.map((c) => c.options[k]!.id)).outcome);
    console.log(
      `DENGE strateji tohum=1000 rastgele=${(100 * p).toFixed(2)}% esik=±${(400 * sd).toFixed(1)}puan ` +
        oranlar.map((o, k) => `hep-${k + 1}=${(100 * o).toFixed(1)}%`).join(' ') +
        ` | sabit_sira(v1.0): ${sabit.map((o, k) => `hep-${k + 1}=${o}`).join(' ')}`,
    );
    for (const o of oranlar) expect(Math.abs(o - p)).toBeLessThan(4 * sd);
  });

  it('senaryo sonuçları (rapor)', () => {
    const scenarios: Record<string, string[]> = {
      'Müşteri odaklı': strategy((o) => o.effects.customers),
      'Altyapı odaklı': strategy((o) => (o.tags.includes('altyapı') ? 1 : 0)),
      'Nakit koruyan': strategy((o) => o.effects.cash),
      'Moral odaklı': strategy((o) => o.effects.morale),
    };
    const lines = [
      `DENGE ${CARD_SET_VERSION} toplam=${t.total} kazanma=${t.won} (${pct(t.won, t.total)}) kasa_tukendi=${t.cash} (${pct(t.cash, t.total)}) musteri_hedefi_kacti=${t.missed} (${pct(t.missed, t.total)})`,
      `DENGE batis_turu ${t.bustTurn.map((n, i) => (n ? `${i}:${pct(n, t.total)}` : '')).filter(Boolean).join(' ')}`,
      `DENGE unvanlar ${Object.entries(t.awards).map(([k, v]) => `${k}=${pct(v, t.total)}`).join(' | ')}`,
    ];
    for (const [name, seq] of Object.entries(scenarios)) {
      const s = play(CARDS, seq);
      lines.push(`DENGE senaryo "${name}" sonuc=${s.endReason} tur=${s.decisionHistory.length} kasa=${s.cash} musteri=${s.customers} moral=${s.morale}`);
    }
    console.log(lines.join('\n'));
    expect(play(CARDS, scenarios['Müşteri odaklı']!).outcome).toBe('won');
    expect(play(CARDS, scenarios['Altyapı odaklı']!).endReason).toBe('cash_depleted');
  });
});
