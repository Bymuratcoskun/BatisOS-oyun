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
  /** v1.2 deste biçimi: toplamı `turns` olmalı (havuz doğrulaması denetler). Sıra: başlangıç, gelişme, final. */
  deckShape: { baslangic: 4, gelisme: 7, final: 1 },
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
    deck: [],
    chainsOn: false,
    chains: [],
  };
}

function freshGame(openingNote: string | null, seed: number, deck: readonly string[], chainsOn: boolean): GameState {
  return { ...initialState(), phase: 'choosing', openingNote, seed, deck: [...deck], chainsOn };
}

function deckError(deck: readonly string[]): string | null {
  return deck.length === RULES.turns ? null : `Deste ${deck.length} kart; tam olarak ${RULES.turns} olmalı`;
}

/**
 * "Yeni oyun" — yalnız başlangıç görünümünde kabul edilir. `seed` ve `deck` dışarıdan gelir
 * (çekirdek rastgele üretmez): seçenek sırası tohumdan, deste denetleyicinin kurduğu kart kimlikleri.
 * v1.3: `chainsOn` olay zincirlerini açar (havuz); varsayılan kapalı (klasik, eski testler).
 */
export function newGame(state: GameState, seed: number, deck: readonly string[], chainsOn = false): Result {
  if (state.phase !== 'start') {
    return { ok: false, reason: `Yeni oyun yalnız başlangıçta açılır (şu an: ${state.phase})`, state };
  }
  const e = deckError(deck);
  if (e) return { ok: false, reason: e, state };
  return { ok: true, state: freshGame(null, seed, deck, chainsOn) };
}

/** "Yeniden dene" / "Suçu teknoloji yığınına at" — yalnız oyun sonunda. Her yeni oyun yeni tohum ve deste alır. */
export function restart(state: GameState, blameTech: boolean, seed: number, deck: readonly string[], chainsOn = false): Result {
  if (state.phase !== 'finished') {
    return { ok: false, reason: `Yeniden başlatma yalnız oyun sonunda yapılır (şu an: ${state.phase})`, state };
  }
  const e = deckError(deck);
  if (e) return { ok: false, reason: e, state };
  return { ok: true, state: freshGame(blameTech ? BLAME_NOTE : null, seed, deck, chainsOn) };
}
