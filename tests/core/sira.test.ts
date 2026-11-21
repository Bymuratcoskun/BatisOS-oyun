// v1.1 seçenek sırası (K14): tohumdan türer, belirlenimci, her kart için geçerli bir permütasyon.
import { describe, expect, it } from 'vitest';
import { initialState, newGame, restart } from '../../src/core/new-game.ts';
import { newSeed, optionOrder } from '../../src/core/option-order.ts';
import { CARDS } from '../../src/content/cards.ts';
import { EARLY_BUST, must, play, KLASIK_IDS } from '../helpers.ts';

describe('Seçenek sırası', () => {
  it('her tohum ve turda [0,1,2]\'nin bir permütasyonu', () => {
    for (let seed = 0; seed < 2000; seed++) {
      for (let t = 0; t < 12; t++) expect([...optionOrder(seed, t)].sort()).toEqual([0, 1, 2]);
    }
  });

  it('aynı tohum + tur → aynı sıra (yeniden çizimde yer değişmez)', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let t = 0; t < 12; t++) expect(optionOrder(seed, t)).toEqual(optionOrder(seed, t));
    }
  });

  it('altı sıralamanın altısı da çıkıyor, hiçbiri ezici değil (12.000 örnek; beklenen her biri 2000)', () => {
    const say: Record<string, number> = {};
    for (let seed = 0; seed < 1000; seed++) {
      for (let t = 0; t < 12; t++) {
        const k = optionOrder(seed, t).join('');
        say[k] = (say[k] ?? 0) + 1;
      }
    }
    expect(Object.keys(say).sort()).toEqual(['012', '021', '102', '120', '201', '210']);
    // Eşik: binom SD = √(12000·1/6·5/6) ≈ 40,8; 5 SD ≈ 204 → 2000 ± 204 dışı bozuk üreteç demektir.
    for (const n of Object.values(say)) expect(Math.abs(n - 2000)).toBeLessThan(204);
  });

  it('yeni oyun ve yeniden başlatma verilen tohumu taşır; tohum kuralları değiştirmez', () => {
    expect(must(newGame(initialState(), 42, KLASIK_IDS)).seed).toBe(42);
    const fin = play(CARDS, EARLY_BUST);
    expect(must(restart(fin, false, 7, KLASIK_IDS)).seed).toBe(7);
    // Aynı karar dizisi, farklı tohum: aynı sonuç (sıra yalnız ekran içindir).
    const a = play(CARDS, EARLY_BUST);
    expect({ ...a, seed: 0 }).toEqual({ ...play(CARDS, EARLY_BUST), seed: 0 });
  });

  it('newSeed 32 bit işaretsiz tam sayı üretir', () => {
    for (let i = 0; i < 50; i++) {
      const s = newSeed();
      expect(Number.isInteger(s) && s >= 0 && s < 2 ** 32).toBe(true);
    }
  });
});
