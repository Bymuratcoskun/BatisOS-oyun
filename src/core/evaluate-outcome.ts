import { RULES } from './new-game.ts';
import type { EndReason, Outcome } from './types.ts';

/**
 * Bitiş kurallarının önceliği — Mimari_sema "Bitiş kurallarının önceliği":
 * 1. Kasa 0 TL veya altında → kaybet (kasa tükendi). Aynı kararla gelen müşteri kurtarmaz.
 * 2. Son kartın kararı uygulanmadıysa → devam.
 * 3. Müşteri ≥ hedef → kazan; değilse kaybet (müşteri hedefi kaçtı).
 */
export function evaluateOutcome(
  cash: number,
  customers: number,
  decidedTurns: number,
  totalTurns: number,
): { outcome: Outcome; endReason: EndReason | null } {
  if (cash <= 0) return { outcome: 'lost', endReason: 'cash_depleted' };
  if (decidedTurns < totalTurns) return { outcome: 'ongoing', endReason: null };
  if (customers >= RULES.customerTarget) return { outcome: 'won', endReason: 'goals_met' };
  return { outcome: 'lost', endReason: 'customer_target_missed' };
}
