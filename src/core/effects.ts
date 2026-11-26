import { RULES } from './new-game.ts';
import type { Stats } from './types.ts';

/**
 * Bir seçeneğin etkisini uygular — tek yer (karar işlenirken de, uyarı hesaplanırken de bu kullanılır).
 * Kasa negatif olabilir (oyun hemen biter); müşteri 0'ın altına inmez; moralin üst sınırı var, alt sınırı yok (K13).
 */
export function applyEffects(before: Stats, effects: Stats): Stats {
  return {
    cash: before.cash + effects.cash,
    customers: Math.max(0, before.customers + effects.customers),
    morale: Math.min(RULES.moraleMax, before.morale + effects.morale),
  };
}
