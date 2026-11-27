// v1.4 çeviri katmanı. Çekirdek Türkçe çalışır (kural ve test değişmez); ekrana yazılacak metin burada,
// kart/seçenek KİMLİĞİNDEN seçilen dile çevrilir. Bu yüzden dil oyunun ortasında da değişebilir ve
// aynı tohum iki dilde birebir aynı oyunu verir (tests/content/ceviri.test.ts).
import { BLAME_NOTE } from '../core/new-game.ts';
import { CHAIN_RULES, chainEpilogues, chainHints, fill, followUpId, icAlinti, unplayedChains } from '../core/chains.ts';
import type { Award, ReportCard } from '../core/calculate-awards.ts';
import { CHAIN_IDS, type Card, type ChainEvent, type ChainId, type DecisionRecord, type GameState, type Option } from '../core/types.ts';
import type { Dil } from './dil.ts';
import { KARTLAR_EN, SUC_NOTU_EN, UNVAN_EN, YATIRIMCI_EN, ZINCIR_EN, type SecenekEN } from './icerik-en.ts';

const zincirOf = (cardId: string): ChainId | undefined => CHAIN_IDS.find((c) => followUpId(c) === cardId);

/** Bir seçeneğin İngilizce metni (takip kartı seçenekleri dahil; yer tutucusu doldurulmamış). */
function secenekEN(cardId: string, optionId: string): SecenekEN | undefined {
  const z = zincirOf(cardId);
  return z ? ZINCIR_EN[z].card.options[optionId] : KARTLAR_EN[cardId]?.options[optionId];
}

/** Zinciri açan kararın İngilizce metni (takip kartının alıntısı). */
function tetikEN(e: ChainEvent, s: GameState): string {
  const d = s.decisionHistory.find((x) => x.turn === e.turn);
  return d ? (secenekEN(d.cardId, d.optionId)?.text ?? e.quote) : e.quote;
}

const zincirDegerleri = (e: ChainEvent, s: GameState, musteri: number) => ({ hafta: e.turn, karar: icAlinti(tetikEN(e, s)), musteri });

/** Bu haftanın kartı seçilen dilde. Kimlikler, sayılar ve etiketler değişmez. */
export function kartYerel(card: Card, s: GameState, dil: Dil): Card {
  if (dil === 'tr') return card;
  const z = zincirOf(card.id);
  const e = z ? s.chains.find((x) => x.chain === z) : undefined;
  const en = z ? ZINCIR_EN[z].card : KARTLAR_EN[card.id];
  if (!en) return card; // eksik çeviri açılışta içerik hatası olarak durdurulur (dogrulaIngilizce)
  const v = e ? zincirDegerleri(e, s, s.customers) : {};
  const o = (x: Option): Option => {
    const t = en.options[x.id];
    return t ? { ...x, text: fill(t.text, v), log: fill(t.log, v) } : x;
  };
  const [a, b, c] = card.options;
  return { ...card, title: fill(en.title, v), description: fill(en.description, v), options: [o(a), o(b), o(c)] };
}

/** Geçmiş bir kararın metni ve günlük satırı seçilen dilde. */
export function kararYerel(d: DecisionRecord, s: GameState, dil: Dil): { text: string; log: string } {
  if (dil === 'tr') return { text: d.optionText, log: d.log };
  const t = secenekEN(d.cardId, d.optionId);
  if (!t) return { text: d.optionText, log: d.log };
  const z = zincirOf(d.cardId);
  const e = z ? s.chains.find((x) => x.chain === z) : undefined;
  // Takip kartının günlüğü, kart açıldığı andaki müşteri sayısıyla dolmuştu (= kararın öncesi).
  const v = e ? zincirDegerleri(e, s, d.before.customers) : {};
  return { text: fill(t.text, v), log: fill(t.log, v) };
}

/** Seçim ekranındaki zincir uyarıları seçilen dilde (söyledikleri yine planChains'ten). */
export function ipuclariYerel(s: GameState, o: Option, dil: Dil): string[] {
  const turn = s.turnIndex + 1;
  return chainHints(s, o).map((h) => {
    if (dil === 'tr') return h.text;
    const t = ZINCIR_EN[h.chain];
    return fill(h.slot === null ? t.hintEnd : t.hintSlot, { gun: h.slot === null ? 0 : h.slot - turn, esik: CHAIN_RULES.teslimEsigi });
  });
}

/** Sonuç ekranının "geride kalanlar" satırları seçilen dilde. */
export function sonSozlerYerel(s: GameState, dil: Dil): string[] {
  if (dil === 'tr') return chainEpilogues(s);
  return unplayedChains(s).map((e) => fill(ZINCIR_EN[e.chain].epilogue, zincirDegerleri(e, s, s.customers)));
}

export function unvanYerel(a: Award, dil: Dil): { title: string; quip: string } {
  return dil === 'tr' ? a : (UNVAN_EN[a.id] ?? a);
}

export function yatirimciYerel(r: ReportCard, dil: Dil): string {
  return dil === 'tr' ? r.investorComment : (YATIRIMCI_EN[r.investorKey] ?? r.investorComment);
}

export function sonHarcamaYerel(r: ReportCard, s: GameState, dil: Dil): string | null {
  return r.lastSpendRecord === null ? null : kararYerel(r.lastSpendRecord, s, dil).text;
}

export function acilisNotuYerel(note: string, dil: Dil): string {
  return dil === 'en' && note === BLAME_NOTE ? SUC_NOTU_EN : note;
}
