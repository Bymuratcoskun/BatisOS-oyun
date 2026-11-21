import { applyChoice, nextTurn, showResults } from '../core/apply-choice.ts';
import { initialState, newGame, restart } from '../core/new-game.ts';
import { newSeed } from '../core/option-order.ts';
import type { Card, GameState, Result } from '../core/types.ts';

/** Oyuncu komutları — Mimari_sema "Geçerli komutlar". */
export type Command =
  | { type: 'new-game' }
  | { type: 'choose'; cardId: string; optionId: string }
  | { type: 'next-turn' }
  | { type: 'show-results' }
  | { type: 'restart'; blameTech: boolean };

/**
 * Oyun akışı: komutu doğru aşamada çekirdeğe iletir, yeni durumu saklar.
 * Kart etkilerini kendisi hesaplamaz. Reddedilen komut durumu değiştirmez ve
 * sessiz geçmez: nedeni konsola yazılır.
 */
export function createController(cards: readonly Card[], onChange: (s: GameState) => void) {
  let state = initialState();

  function run(cmd: Command): Result {
    switch (cmd.type) {
      case 'new-game':
        return newGame(state, newSeed());
      case 'choose':
        return applyChoice(state, cards, cmd.cardId, cmd.optionId);
      case 'next-turn':
        return nextTurn(state, cards);
      case 'show-results':
        return showResults(state);
      case 'restart':
        return restart(state, cmd.blameTech, newSeed());
    }
  }

  return {
    getState: () => state,
    dispatch(cmd: Command): boolean {
      const r = run(cmd);
      if (!r.ok) {
        console.warn(`[BatışOS] Komut reddedildi (${cmd.type}): ${r.reason}`);
        return false;
      }
      state = r.state;
      onChange(state);
      return true;
    },
  };
}
