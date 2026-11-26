// v1.3 olay zincirleri — kurallar (docs/raporlar/TASARIM-v1.3-zincirler.md, operatör onayı 2026-11-26).
// Kurallar:
// 1. Her zincir bir oyunda en fazla bir kez açılır.
// 2. Takip kartı tetikleyen haftadan `delay` hafta sonra gelir; o hafta doluysa bir sonraki.
// 3. Yalnız final dışı bir haftanın yerini alır; deste 12 kart kalır.
// 4. Yer yoksa ya da oyun o kararla bittiyse takip kartı gelmez; sonuç ekranına son söz yazılır.
// 5. Uyarı ile gerçek aynı işlevden gelir (`planChains`): uyarının söylediği gerçekleşir.
import { CHAIN_TEMPLATES } from '../content/chains.ts';
import { applyEffects } from './effects.ts';
import { evaluateOutcome } from './evaluate-outcome.ts';
import { RULES } from './new-game.ts';
import { CHAIN_IDS, type Card, type ChainEvent, type ChainId, type GameState, type Option, type Stats } from './types.ts';

/** TAHMİN değerler (tasarım taslağı §"Kurallar"); oynandıktan sonra ayarlanır. */
export const CHAIN_RULES = {
  delay: 3,
  /** C eşiği: hedefin (10) yarısını geçmek. Rastgele oyunda %71,7 açılır (ölçüldü 2026-11-26). */
  teslimEsigi: 6,
} as const;

export const followUpId = (chain: ChainId): string => CHAIN_TEMPLATES[chain].card.id;

function triggered(chain: ChainId, option: Option, before: Stats, after: Stats): boolean {
  switch (chain) {
    case 'bakim':
      return option.tags.includes('altyapı');
    case 'soz':
      return option.tags.includes('tanıtım');
    case 'teslim':
      return before.customers < CHAIN_RULES.teslimEsigi && after.customers >= CHAIN_RULES.teslimEsigi;
  }
}

/**
 * Bu seçenek seçilirse hangi zincirler açılır, takip kartları hangi haftaya düşer?
 * Karar işlenirken de (applyChoice) seçim ekranındaki uyarıda da bu çağrılır.
 */
export function planChains(state: GameState, option: Option): ChainEvent[] {
  if (!state.chainsOn || state.chains.length === CHAIN_IDS.length) return [];
  const before: Stats = { cash: state.cash, customers: state.customers, morale: state.morale };
  const after = applyEffects(before, option.effects);
  // Önce yalnız tetik denetimi (çoğu kararda hiçbiri tetiklenmez; denge testi 3^12 × 100 deste koşar).
  const acilan = CHAIN_IDS.filter((chain) => !state.chains.some((e) => e.chain === chain) && triggered(chain, option, before, after));
  if (acilan.length === 0) return [];
  const turn = state.turnIndex + 1;
  const gameOver = evaluateOutcome(after.cash, after.customers, turn, RULES.turns).outcome !== 'ongoing';
  const taken = new Set(state.chains.flatMap((e) => (e.slot === null ? [] : [e.slot])));
  const lastSlot = RULES.turns - 1; // final yerinden çıkmaz
  const out: ChainEvent[] = [];
  for (const chain of acilan) {
    let slot: number | null = null;
    if (!gameOver) {
      let t = turn + CHAIN_RULES.delay;
      while (t <= lastSlot && taken.has(t)) t++;
      if (t <= lastSlot) {
        slot = t;
        taken.add(t);
      }
    }
    out.push({ chain, turn, quote: chain === 'teslim' ? '' : option.text, slot });
  }
  return out;
}

/** Alıntı içinde çift tırnak tek tırnağa döner: “Sitene ‘yapay zekâ destekli’ yaz”. */
const icAlinti = (s: string) => s.replace(/“/g, '‘').replace(/”/g, '’');

function fill(text: string, v: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m)); // tanımsız yer tutucu kalır → doğrulama yakalar
}

/** Aynı olay + aynı müşteri sayısı = aynı kart; olaylar değişmez nesneler olduğu için güvenle saklanır. */
const kartlar = new WeakMap<ChainEvent, Map<number, Card>>();

/** Takip kartı, oyunun kendisinden doldurulmuş hâliyle. `customers`: kartın açıldığı andaki müşteri sayısı. */
export function followUpCard(e: ChainEvent, customers: number): Card {
  let m = kartlar.get(e);
  if (m === undefined) kartlar.set(e, (m = new Map()));
  let k = m.get(customers);
  if (k === undefined) m.set(customers, (k = buildFollowUp(e, customers)));
  return k;
}

function buildFollowUp(e: ChainEvent, customers: number): Card {
  const t = CHAIN_TEMPLATES[e.chain].card;
  const v = { hafta: e.turn, karar: icAlinti(e.quote), musteri: customers };
  const f = (o: Option): Option => ({ ...o, text: fill(o.text, v), log: fill(o.log, v) });
  const [a, b, c] = t.options;
  return { ...t, title: fill(t.title, v), description: fill(t.description, v), options: [f(a), f(b), f(c)] };
}

/** Bu haftanın kartı: takip kartı geldiyse o, değilse destedeki kart. */
export function cardAt(state: GameState, cards: readonly Card[]): Card | undefined {
  const e = state.chains.find((x) => x.slot === state.turnIndex + 1);
  return e ? followUpCard(e, state.customers) : cards[state.turnIndex];
}

export interface ChainHint {
  chain: ChainId;
  slot: number | null;
  text: string;
}

/** Seçim ekranındaki uyarı: bu seçenek henüz açılmamış bir zinciri açıyorsa ne olacağını kesin söyler. */
export function chainHints(state: GameState, option: Option): ChainHint[] {
  const turn = state.turnIndex + 1;
  return planChains(state, option).map((e) => {
    const t = CHAIN_TEMPLATES[e.chain];
    const v = { gun: e.slot === null ? 0 : e.slot - turn, esik: CHAIN_RULES.teslimEsigi };
    return { chain: e.chain, slot: e.slot, text: fill(e.slot === null ? t.hintEnd : t.hintSlot, v) };
  });
}

/** Sonuç ekranı: açılıp takip kartı oynanmamış zincirlerin son sözü. */
export function chainEpilogues(state: GameState): string[] {
  return state.chains
    .filter((e) => !state.decisionHistory.some((d) => d.cardId === followUpId(e.chain)))
    .map((e) => fill(CHAIN_TEMPLATES[e.chain].epilogue, { karar: icAlinti(e.quote), musteri: state.customers }));
}
