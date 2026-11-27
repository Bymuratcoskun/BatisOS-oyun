// v1.4 dil seçimi: Türkçe (asıl metin) ve İngilizce. Öncelik: adresteki `?lang=` → bu tarayıcıda saklanan
// seçim → tarayıcının dili (tr… ise Türkçe, değilse İngilizce). Saklanamazsa oyun yine açılır.
export const DILLER = ['tr', 'en'] as const;
export type Dil = (typeof DILLER)[number];

export const DIL_ANAHTAR = 'batisos-dil';

const gecerli = (x: string | null | undefined): Dil | null => (x === 'tr' || x === 'en' ? x : null);

export function dilSec(search: string, saklanan: string | null, tarayici: readonly string[]): Dil {
  const q = gecerli(new URLSearchParams(search).get('lang'));
  if (q) return q;
  const s = gecerli(saklanan);
  if (s) return s;
  return tarayici.some((l) => l.toLowerCase().startsWith('tr')) ? 'tr' : tarayici.length ? 'en' : 'tr';
}
