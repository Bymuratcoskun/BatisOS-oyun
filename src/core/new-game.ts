import type { GameState, Result } from './types.ts';

/**
 * Başlangıç değerleri ve bitiş eşikleri — TEK yer (Geliştirme_Asamalari Aşama 0).
 * Kaynak: README "Başlangıç değerleri" ve "Kazanma ve kaybetme".
 */
export const RULES = {
  startCash: 100_000,
  startCustomers: 0,
  startMorale: 80,
  turns: 12,
  customerTarget: 10,
  moraleMax: 100, // alt sınır yok: moral kasa gibi sıfırın altına inebilir, oyunu bitirmez (K13)
} as const;

export const BLAME_NOTE = 'Sorumluluk devredildi.';

export function initialState(): GameState {
  return {
    phase: 'start',
    turnIndex: 0,
    cash: RULES.startCash,
    customers: RULES.startCustomers,
    morale: RULES.startMorale,
    decisionHistory: [],
    outcome: 'ongoing',
    endReason: null,
    openingNote: null,
    seed: 0,
  };
}

function freshGame(openingNote: string | null, seed: number): GameState {
  return { ...initialState(), phase: 'choosing', openingNote, seed };
}

/** "Yeni oyun" — yalnız başlangıç görünümünde kabul edilir. `seed`: seçenek sırası (çekirdek rastgele üretmez). */
export function newGame(state: GameState, seed: number): Result {
  if (state.phase !== 'start') {
    return { ok: false, reason: `Yeni oyun yalnız başlangıçta açılır (şu an: ${state.phase})`, state };
  }
  return { ok: true, state: freshGame(null, seed) };
}

/** "Yeniden dene" / "Suçu teknoloji yığınına at" — yalnız oyun sonunda. Her yeni oyun yeni tohum alır. */
export function restart(state: GameState, blameTech: boolean, seed: number): Result {
  if (state.phase !== 'finished') {
    return { ok: false, reason: `Yeniden başlatma yalnız oyun sonunda yapılır (şu an: ${state.phase})`, state };
  }
  return { ok: true, state: freshGame(blameTech ? BLAME_NOTE : null, seed) };
}
