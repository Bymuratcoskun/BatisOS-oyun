// README "Kabul ölçütleri" tablosu + "Test senaryoları" — her satır bir test.
import { describe, expect, it } from 'vitest';
import { applyChoice, nextTurn, showResults } from '../../src/core/apply-choice.ts';
import { BLAME_NOTE, initialState, newGame, restart, RULES } from '../../src/core/new-game.ts';
import type { GameState } from '../../src/core/types.ts';
import { CARDS } from '../../src/content/cards.ts';
import { moraleText } from '../../src/ui/render.ts';
import { cardWith, EARLY_BUST, must, play, started, WIN, KLASIK_IDS } from '../helpers.ts';

/** 12 kartlık sahte set: yalnız `last` kartının etkisi farklı. */
function deckEndingWith(effects: { cash: number; customers: number; morale: number }) {
  const zero = { cash: 0, customers: 0, morale: 0 };
  return Array.from({ length: 12 }, (_, i) => cardWith(`k${i + 1}`, i === 11 ? effects : zero));
}
function atTurn(turnIndex: number, s: Partial<GameState>): GameState {
  return { ...started(), turnIndex, ...s };
}

describe('Kabul ölçütleri (README)', () => {
  it('Yeni oyun başlatılır → başlangıç değerleri doğru', () => {
    const s = started();
    expect(s).toMatchObject({ phase: 'choosing', turnIndex: 0, cash: 100_000, customers: 0, morale: 80 });
    expect(s.decisionHistory).toEqual([]);
    expect(RULES.turns).toBe(12);
  });

  it('Bir seçenek seçilir → etkiler yalnızca bir kez uygulanır', () => {
    const s = must(applyChoice(started(), CARDS, 'ilk-musteri', 'csv'));
    expect(s.cash).toBe(95_000);
    expect(s.customers).toBe(3);
    expect(s.decisionHistory).toHaveLength(1);
  });

  it('Aynı düğmeye tekrar basılır → ikinci etki oluşmaz (çekirdek de reddeder)', () => {
    const once = must(applyChoice(started(), CARDS, 'ilk-musteri', 'csv'));
    const twice = applyChoice(once, CARDS, 'ilk-musteri', 'csv');
    expect(twice.ok).toBe(false);
    expect(twice.state).toBe(once);
    expect(twice.state.cash).toBe(95_000);
    expect(twice.state.decisionHistory).toHaveLength(1);
  });

  it('Müşteri kaybı mevcut müşteriden fazla → müşteri 0’da kalır', () => {
    const deck = [cardWith('k', { cash: 0, customers: -5, morale: 0 })];
    const s = must(applyChoice(atTurn(0, { customers: 2 }), deck, 'k', 'a'));
    expect(s.customers).toBe(0);
    expect(s.decisionHistory[0]?.delta.customers).toBe(-2);
  });

  it('Moral 100’ü aşacak şekilde artar → 100’de kalır', () => {
    const deck = [cardWith('k', { cash: 0, customers: 0, morale: 50 })];
    expect(must(applyChoice(atTurn(0, { morale: 90 }), deck, 'k', 'a')).morale).toBe(100);
  });

  it('Moral 0’ın altına iner → negatif değer kalır, oyun sürer (K13: 10 − 50 → −40)', () => {
    const deck = [cardWith('k', { cash: 0, customers: 0, morale: -50 }), cardWith('k2', { cash: 0, customers: 0, morale: 0 })];
    const s = must(applyChoice(atTurn(0, { morale: 10 }), deck, 'k', 'a'));
    expect(s.morale).toBe(-40);
    expect(s.decisionHistory[0]?.delta.morale).toBe(-50);
    expect(s.outcome).toBe('ongoing');
  });

  it('Negatif moral ekranda kasa gibi gerçek eksi işaretiyle yazılır (K13)', () => {
    expect(moraleText(-40)).toBe('−40 / 100');
    expect(moraleText(0)).toBe('0 / 100');
    expect(moraleText(80)).toBe('80 / 100');
  });

  it('Kasa tam 0 TL olur → oyun kaybedilir', () => {
    const deck = [cardWith('k', { cash: -100_000, customers: 0, morale: 0 }), cardWith('k2', { cash: 0, customers: 0, morale: 0 })];
    const s = must(applyChoice(started(), deck, 'k', 'a'));
    expect(s.cash).toBe(0);
    expect(s).toMatchObject({ outcome: 'lost', endReason: 'cash_depleted' });
    expect(nextTurn(s, deck).ok).toBe(false); // kasa tükenince sonraki tur açılmaz
  });

  it('Son turda kasa pozitif ve müşteri 10 → kazanılır', () => {
    const deck = deckEndingWith({ cash: 0, customers: 1, morale: 0 });
    const s = must(applyChoice(atTurn(11, { cash: 1, customers: 9 }), deck, 'k12', 'a'));
    expect(s).toMatchObject({ customers: 10, outcome: 'won', endReason: 'goals_met' });
  });

  it('Son turda kasa pozitif ve müşteri 9 → kaybedilir', () => {
    const deck = deckEndingWith({ cash: 0, customers: 0, morale: 0 });
    const s = must(applyChoice(atTurn(11, { cash: 50_000, customers: 9 }), deck, 'k12', 'a'));
    expect(s).toMatchObject({ outcome: 'lost', endReason: 'customer_target_missed' });
  });

  it('Oyun biter → yeni karar alınamaz', () => {
    const deck = deckEndingWith({ cash: 0, customers: 0, morale: 0 });
    const ended = must(applyChoice(atTurn(11, {}), deck, 'k12', 'a'));
    const fin = must(showResults(ended));
    for (const s of [ended, fin]) {
      const r = applyChoice(s, deck, 'k12', 'b');
      expect(r.ok).toBe(false);
      expect(r.state).toBe(s);
    }
  });

  it('Yeniden başlatılır → önceki oyunun durumu temizlenir', () => {
    const fin = play(CARDS, EARLY_BUST);
    expect(fin.phase).toBe('finished');
    const s = must(restart(fin, false, 1, KLASIK_IDS));
    expect(s).toMatchObject({ phase: 'choosing', turnIndex: 0, cash: 100_000, customers: 0, morale: 80, outcome: 'ongoing', endReason: null, openingNote: null });
    expect(s.decisionHistory).toEqual([]);
  });

  it('Aynı seçim dizisi tekrar oynanır → aynı sonuç', () => {
    const seq = WIN;
    expect(play(CARDS, seq)).toEqual(play(CARDS, seq));
  });
});

describe('Test senaryoları (README)', () => {
  it('Son turda kasa tükenmesi: müşteri hedefi tutsa da kaybedilir', () => {
    const deck = deckEndingWith({ cash: -5_000, customers: 3, morale: 0 });
    const s = must(applyChoice(atTurn(11, { cash: 5_000, customers: 9 }), deck, 'k12', 'a'));
    expect(s).toMatchObject({ cash: 0, customers: 12, outcome: 'lost', endReason: 'cash_depleted' });
  });

  it('Aynı seçeneğin tekrar işlenmesi: 20.000 → 15.000, geçmişte 1 karar', () => {
    const deck = [cardWith('k', { cash: -5_000, customers: 0, morale: 0 }), cardWith('k2', { cash: 0, customers: 0, morale: 0 })];
    const s0 = atTurn(0, { cash: 20_000 });
    const s1 = must(applyChoice(s0, deck, 'k', 'a'));
    const s2 = applyChoice(s1, deck, 'k', 'a').state;
    expect(s2.cash).toBe(15_000);
    expect(s2.decisionHistory).toHaveLength(1);
  });

  it('Sınırda moral artışı: 95 + 20 → 100, gerçek değişim +5', () => {
    const deck = [cardWith('k', { cash: 0, customers: 0, morale: 20 })];
    const s = must(applyChoice(atTurn(0, { morale: 95 }), deck, 'k', 'a'));
    expect(s.morale).toBe(100);
    expect(s.decisionHistory[0]?.delta.morale).toBe(5);
  });

  it('“Suçu teknoloji yığınına at” → aynı sıfırlama + “Sorumluluk devredildi”', () => {
    const fin = play(CARDS, EARLY_BUST);
    const s = must(restart(fin, true, 1, KLASIK_IDS));
    expect(s).toMatchObject({ turnIndex: 0, cash: 100_000, customers: 0, morale: 80, openingNote: BLAME_NOTE });
    expect(s.decisionHistory).toEqual([]);
    expect(BLAME_NOTE).toBe('Sorumluluk devredildi.');
  });
});

describe('Komutlar yanlış aşamada durumu değiştirmez (Mimari "Geçerli komutlar")', () => {
  const deck = CARDS;
  it('Başlangıçta karar alınamaz', () => {
    const s = initialState();
    expect(applyChoice(s, deck, 'ilk-musteri', 'csv')).toMatchObject({ ok: false, state: s });
  });
  it('Oyun sürerken yeni oyun / yeniden başlatma reddedilir', () => {
    const s = started();
    expect(newGame(s, 1, KLASIK_IDS).ok).toBe(false);
    expect(restart(s, false, 1, KLASIK_IDS).ok).toBe(false);
  });
  it('Başka kartın seçeneği ve olmayan seçenek reddedilir', () => {
    const s = started();
    expect(applyChoice(s, deck, 'rakip', 'rust').ok).toBe(false);
    expect(applyChoice(s, deck, 'ilk-musteri', 'yok-boyle').ok).toBe(false);
  });
  it('Oyun sürerken sonuç ekranı açılmaz; karar beklerken sonraki tur açılmaz', () => {
    const s = must(applyChoice(started(), deck, 'ilk-musteri', 'csv'));
    expect(showResults(s).ok).toBe(false);
    expect(nextTurn(started(), deck).ok).toBe(false);
  });
  it('Son turdan sonra 13. kart açılmaz; 12. kart sonrası sonuç ekranı gelir', () => {
    const s = play(deck, WIN);
    expect(s.phase).toBe('finished');
    expect(s.decisionHistory).toHaveLength(12);
    expect(s.turnIndex).toBe(11);
  });
  it('Girdi durumu değiştirilmez (yeni durum üretilir)', () => {
    const s = started();
    const snapshot = JSON.stringify(s);
    applyChoice(s, deck, 'ilk-musteri', 'csv');
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});
