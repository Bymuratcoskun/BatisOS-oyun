import { applyChoice, nextTurn, showResults } from '../core/apply-choice.ts';
import { buildDeck } from '../core/deck.ts';
import { initialState, newGame, restart } from '../core/new-game.ts';
import { newSeed } from '../core/option-order.ts';
import type { Card, GameState, PoolCard, Result } from '../core/types.ts';

/** Oyuncu komutları — Mimari_sema "Geçerli komutlar". */
export type Command =
  | { type: 'new-game' }
  | { type: 'choose'; cardId: string; optionId: string }
  | { type: 'next-turn' }
  | { type: 'show-results' }
  | { type: 'restart'; blameTech: boolean };

/** v1.2: "havuz" her oyunda havuzdan deste kurar; "klasik" eski 12 kartı eski sırasıyla verir (`#klasik`). */
export type DeckMode = 'havuz' | 'klasik';

/**
 * Oyun akışı: komutu doğru aşamada çekirdeğe iletir, yeni durumu saklar.
 * Kart etkilerini kendisi hesaplamaz. Reddedilen komut durumu değiştirmez ve
 * sessiz geçmez: nedeni konsola yazılır.
 * Deste burada kurulur (çekirdek rastgele üretmez); oyunun destesi `getCards()` ile okunur.
 */
export function createController(
  pool: readonly PoolCard[],
  classic: readonly Card[],
  mode: DeckMode,
  onChange: (s: GameState) => void,
  /** v1.2: bağlantıdaki tohum (`#tohum-N`); yalnız ilk oyunda kullanılır, "Yeniden dene" yeni deste getirir. */
  firstSeed?: number,
) {
  let state = initialState();
  let cards: readonly Card[] = classic;
  let pendingSeed = firstSeed;

  /** Yeni tohum ve deste; deste kurulamazsa nedeniyle ret. */
  function freshDeck(): { ok: true; seed: number; deck: readonly Card[] } | { ok: false; reason: string } {
    const seed = pendingSeed ?? newSeed();
    pendingSeed = undefined;
    if (mode === 'klasik') return { ok: true, seed, deck: classic };
    const r = buildDeck(pool, seed);
    return r.ok ? { ok: true, seed, deck: r.deck } : r;
  }

  function run(cmd: Command): Result & { deck?: readonly Card[] } {
    switch (cmd.type) {
      case 'new-game':
      case 'restart': {
        const d = freshDeck();
        if (!d.ok) return { ok: false, reason: d.reason, state };
        const ids = d.deck.map((c) => c.id);
        const zincir = mode === 'havuz'; // v1.3: klasik deste zincirsiz (tasarım kuralı 7)
        const r = cmd.type === 'new-game' ? newGame(state, d.seed, ids, zincir) : restart(state, cmd.blameTech, d.seed, ids, zincir);
        return r.ok ? { ...r, deck: d.deck } : r;
      }
      case 'choose':
        return applyChoice(state, cards, cmd.cardId, cmd.optionId);
      case 'next-turn':
        return nextTurn(state, cards);
      case 'show-results':
        return showResults(state);
    }
  }

  return {
    getState: () => state,
    getCards: () => cards,
    mode,
    dispatch(cmd: Command): boolean {
      const r = run(cmd);
      if (!r.ok) {
        console.warn(`[BatışOS] Komut reddedildi (${cmd.type}): ${r.reason}`);
        return false;
      }
      if (r.deck) cards = r.deck;
      state = r.state;
      onChange(state);
      return true;
    },
  };
}
