// v1.4 çeviri kapısı: İngilizce içerik Türkçe içerikle aynı iskelette mi? Oyun açılışta da bunu koşar
// (main.ts); eksik çeviriyle oyun başlamaz, nedeni adıyla yazılır (sessiz Türkçeye düşmez).
import { CHAIN_IDS, type Card, type ChainId } from '../core/types.ts';
import { INVESTOR_COMMENTS } from '../core/calculate-awards.ts';
import type { ChainTemplate } from '../content/chains.ts';
import type { KartEN, ZincirEN } from './icerik-en.ts';

/** Çevrilmeden kalan Türkçe metni yakalar. Yer adı/marka gibi istisna yok; gerekirse adıyla eklenir. */
export const TURKCE_HARF = /[çğıöşüÇĞİÖŞÜâîû]/;

const yerTutucular = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

function alan(out: string[], yer: string, tr: string, en: string | undefined): void {
  if (en === undefined || en.trim() === '') return void out.push(`${yer}: İngilizcesi yok`);
  // Türkçe harfi olmayan Türkçe metin ("Ertele") harf denetiminden kaçar; aynısı kalmışsa çevrilmemiştir.
  if (tr !== '' && en === tr) out.push(`${yer}: çevrilmemiş (Türkçesiyle aynı: "${en.slice(0, 40)}")`);
  if (TURKCE_HARF.test(en)) out.push(`${yer}: İngilizce metinde Türkçe harf var ("${en.slice(0, 40)}")`);
  if (yerTutucular(tr) !== yerTutucular(en)) out.push(`${yer}: yer tutucular farklı (tr {${yerTutucular(tr)}} · en {${yerTutucular(en)}})`);
}

function kart(out: string[], c: Card, en: KartEN | undefined): void {
  if (!en) return void out.push(`${c.id}: İngilizce kart yok`);
  alan(out, `${c.id}/başlık`, c.title, en.title);
  alan(out, `${c.id}/açıklama`, c.description, en.description);
  for (const o of c.options) {
    alan(out, `${c.id}/${o.id}/metin`, o.text, en.options[o.id]?.text);
    alan(out, `${c.id}/${o.id}/günlük`, o.log, en.options[o.id]?.log);
  }
  for (const k of Object.keys(en.options)) if (!c.options.some((o) => o.id === k)) out.push(`${c.id}/${k}: Türkçede olmayan İngilizce seçenek`);
}

export function dogrulaIngilizce(
  cards: readonly Card[],
  kartlarEN: Record<string, KartEN>,
  zincirler: Readonly<Record<ChainId, ChainTemplate>>,
  zincirlerEN: Record<ChainId, ZincirEN>,
  unvanIdleri: readonly string[],
  unvanlarEN: Record<string, { title: string; quip: string }>,
  yatirimciEN: Record<string, string>,
): string[] {
  const out: string[] = [];
  for (const c of cards) kart(out, c, kartlarEN[c.id]);
  for (const k of Object.keys(kartlarEN)) if (!cards.some((c) => c.id === k)) out.push(`${k}: Türkçede olmayan İngilizce kart`);
  for (const z of CHAIN_IDS) {
    const t = zincirler[z];
    const en = zincirlerEN[z];
    kart(out, t.card, en?.card);
    if (!en) continue;
    alan(out, `${z}/son söz`, t.epilogue, en.epilogue);
    alan(out, `${z}/uyarı`, t.hintSlot, en.hintSlot);
    alan(out, `${z}/uyarı (yer yok)`, t.hintEnd, en.hintEnd);
  }
  for (const id of unvanIdleri) {
    alan(out, `unvan ${id}/ad`, '', unvanlarEN[id]?.title);
    alan(out, `unvan ${id}/espri`, '', unvanlarEN[id]?.quip);
  }
  for (const k of Object.keys(INVESTOR_COMMENTS)) alan(out, `yatırımcı ${k}`, '', yatirimciEN[k]);
  return out;
}
