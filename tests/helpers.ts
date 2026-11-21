import { applyChoice, nextTurn, showResults } from '../src/core/apply-choice.ts';
import { initialState, newGame } from '../src/core/new-game.ts';
import type { Card, GameState, Result } from '../src/core/types.ts';

/** Kayıtlı diziler (Geliştirme_Asamalari Aşama 4). Beklenen sonuçlar tests/core/kabul.test.ts'de. */
export const WIN = ['csv', 'ode', 'konus', 'sor', 'odeme-sayfasi', 'yardim', 'durust', 'rapor', 'duzelt', 'gitme', 'haklisin', 'imzala'];
/** Erken batış: 5 altyapı, kendi entegrasyonu dahil → 5. turda kasa −10.000. */
export const EARLY_BUST = ['bicim', 'kendimiz', 'rust', 'cekirdek', 'tasarim-sistemi'];

export function must(r: Result): GameState {
  if (!r.ok) throw new Error(`Beklenmeyen ret: ${r.reason}`);
  return r.state;
}

export function started(): GameState {
  return must(newGame(initialState()));
}

/** Bir seçim dizisini baştan oynar; oyun biterse durur ve sonuç ekranını açar. */
export function play(cards: readonly Card[], optionIds: readonly string[]): GameState {
  let s = started();
  for (const optionId of optionIds) {
    const card = cards[s.turnIndex];
    if (card === undefined) throw new Error(`Tur ${s.turnIndex + 1} için kart yok`);
    s = must(applyChoice(s, cards, card.id, optionId));
    if (s.outcome !== 'ongoing') return must(showResults(s));
    s = must(nextTurn(s, cards));
  }
  return s;
}

/** Tek seçenekli etkiyi belirli bir durumdan denemek için küçük kart. */
export function cardWith(id: string, effects: Card['options'][0]['effects']): Card {
  const o = (oid: string) => ({ id: oid, text: oid, effects, tags: [] as const, log: oid });
  return { id, title: id, description: id, options: [o('a'), o('b'), o('c')] };
}
