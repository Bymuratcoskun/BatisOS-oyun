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
  moraleMin: 0,
  moraleMax: 100,
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
  };
}

function freshGame(openingNote: string | null): GameState {
  return { ...initialState(), phase: 'choosing', openingNote };
}

/** "Yeni oyun" — yalnız başlangıç görünümünde kabul edilir. */
export function newGame(state: GameState): Result {
  if (state.phase !== 'start') {
    return { ok: false, reason: `Yeni oyun yalnız başlangıçta açılır (şu an: ${state.phase})`, state };
  }
  return { ok: true, state: freshGame(null) };
}

/** "Yeniden dene" / "Suçu teknoloji yığınına at" — yalnız oyun sonunda. */
export function restart(state: GameState, blameTech: boolean): Result {
  if (state.phase !== 'finished') {
    return { ok: false, reason: `Yeniden başlatma yalnız oyun sonunda yapılır (şu an: ${state.phase})`, state };
  }
  return { ok: true, state: freshGame(blameTech ? BLAME_NOTE : null) };
}
