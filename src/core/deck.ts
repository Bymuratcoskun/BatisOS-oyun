// v1.2 deste: havuzdan oyun başına 12 kart. Tohumdan türer (aynı tohum + aynı havuz = aynı deste).
// Kurallar: RULES.deckShape kadar başlangıç / gelişme / final kartı, bu sırayla; aynı aileden iki kart
// aynı destede çıkmaz. Kurulamazsa sessiz geçmez: nedenini söyler.
import { RULES } from './new-game.ts';
import { mulberry32, shuffled } from './rng.ts';
import { STAGES, type PoolCard, type Stage } from './types.ts';

export type DeckResult = { ok: true; deck: PoolCard[] } | { ok: false; reason: string };

/** Final önce seçilir (en az aday orada), sonra başlangıç, sonra gelişme; ekran sırası başlangıç → gelişme → final. */
const SECIM_SIRASI: readonly Stage[] = ['final', 'baslangic', 'gelisme'];

export function buildDeck(pool: readonly PoolCard[], seed: number): DeckResult {
  const rnd = mulberry32((seed ^ 0x5bd1e995) | 0);
  const aileler = new Set<string>();
  const secilen: Record<Stage, PoolCard[]> = { baslangic: [], gelisme: [], final: [] };
  for (const evre of SECIM_SIRASI) {
    const gerek = RULES.deckShape[evre];
    for (const kart of shuffled(pool.filter((k) => k.stage === evre), rnd)) {
      if (secilen[evre].length === gerek) break;
      if (kart.family !== undefined && aileler.has(kart.family)) continue;
      secilen[evre].push(kart);
      if (kart.family !== undefined) aileler.add(kart.family);
    }
    if (secilen[evre].length < gerek) {
      return { ok: false, reason: `Deste kurulamadı: "${evre}" evresinde ${gerek} kart gerekli, aile kuralıyla uygun ${secilen[evre].length} kart var (tohum ${seed})` };
    }
  }
  return { ok: true, deck: STAGES.flatMap((e) => secilen[e]) };
}
