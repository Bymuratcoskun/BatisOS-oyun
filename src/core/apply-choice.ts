import { evaluateOutcome } from './evaluate-outcome.ts';
import { RULES } from './new-game.ts';
import type { Card, DecisionRecord, GameState, Result, Stats } from './types.ts';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * "Seçenek seç" — Mimari_sema "Bir kararın işlenmesi".
 * Sıra: geçerlilik → etkiler (tek işlem) → sınırlar → kayıt → bitiş kuralları.
 * Çift tıklama koruması yalnız düğmeye bırakılmaz: aşama ve aktif kart burada da denetlenir.
 * Girdi durumu değiştirilmez; yeni durum üretilir.
 */
export function applyChoice(
  state: GameState,
  cards: readonly Card[],
  cardId: string,
  optionId: string,
): Result {
  if (state.phase !== 'choosing') {
    return { ok: false, reason: `Karar yalnız "karar bekleniyor" aşamasında alınır (şu an: ${state.phase})`, state };
  }
  const card = cards[state.turnIndex];
  if (card === undefined) {
    return { ok: false, reason: `Tur ${state.turnIndex + 1} için kart yok`, state };
  }
  if (card.id !== cardId) {
    return { ok: false, reason: `Seçim aktif karta ait değil (aktif: ${card.id}, gelen: ${cardId})`, state };
  }
  const option = card.options.find((o) => o.id === optionId);
  if (option === undefined) {
    return { ok: false, reason: `"${card.id}" kartında "${optionId}" seçeneği yok`, state };
  }

  const before: Stats = { cash: state.cash, customers: state.customers, morale: state.morale };
  const after: Stats = {
    cash: before.cash + option.effects.cash, // kasa negatif olabilir; oyun hemen biter
    customers: Math.max(0, before.customers + option.effects.customers),
    morale: clamp(before.morale + option.effects.morale, RULES.moraleMin, RULES.moraleMax),
  };
  const delta: Stats = {
    cash: after.cash - before.cash,
    customers: after.customers - before.customers,
    morale: after.morale - before.morale,
  };

  const record: DecisionRecord = {
    turn: state.turnIndex + 1,
    cardId: card.id,
    optionId: option.id,
    optionText: option.text,
    tags: option.tags,
    before,
    after,
    delta,
    log: option.log,
  };
  const decisionHistory = [...state.decisionHistory, record];
  // Tur sayacının tek yetkilisi turnIndex (Mimari: "bağımsız iki tur sayacı tutulmaz").
  const { outcome, endReason } = evaluateOutcome(after.cash, after.customers, state.turnIndex + 1, cards.length);

  return {
    ok: true,
    state: { ...state, ...after, phase: 'result', decisionHistory, outcome, endReason },
  };
}

/** "Sonraki tur" — karar sonucu görünümünde ve oyun sürüyorsa. */
export function nextTurn(state: GameState, cards: readonly Card[]): Result {
  if (state.phase !== 'result') {
    return { ok: false, reason: `Sonraki tur yalnız karar sonucundan açılır (şu an: ${state.phase})`, state };
  }
  if (state.outcome !== 'ongoing') {
    return { ok: false, reason: 'Oyun bitti; sonraki tur açılmaz', state };
  }
  if (state.turnIndex + 1 >= cards.length) {
    return { ok: false, reason: `Son turdan sonra ${cards.length + 1}. kart açılmaz`, state };
  }
  return { ok: true, state: { ...state, phase: 'choosing', turnIndex: state.turnIndex + 1 } };
}

/** "Sonuçları gör" — karar sonucu görünümünde ve oyun bitmişse. */
export function showResults(state: GameState): Result {
  if (state.phase !== 'result') {
    return { ok: false, reason: `Sonuçlar yalnız karar sonucundan görülür (şu an: ${state.phase})`, state };
  }
  if (state.outcome === 'ongoing') {
    return { ok: false, reason: 'Oyun sürüyor; sonuç ekranı açılmaz', state };
  }
  return { ok: true, state: { ...state, phase: 'finished' } };
}
