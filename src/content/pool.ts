// v1.2 kart havuzu: klasik 12 kart (evre ve aileyle) + 15 yeni kart = 27 kart.
// Her oyunda bu havuzdan 12 kartlık bir deste kurulur (src/core/deck.ts). Klasik deste (`#klasik`)
// CARDS'ın kendisidir: eski 12 kart, eski sırasıyla.
import type { PoolCard, Stage } from '../core/types.ts';
import { CARDS } from './cards.ts';
import { NEW_CARDS } from './cards-v12.ts';

export const POOL_VERSION = 'havuz-1'; // 27 kart: kart-seti-1.2 (12) + v1.2 yeni kartlar (15)

/** Klasik kartların evresi. Eksik bir kart havuz doğrulamasında adıyla kırmızı verir. */
const KLASIK_EVRE: Record<string, Stage> = {
  'ilk-musteri': 'baslangic',
  'api-faturasi': 'baslangic',
  rakip: 'baslangic',
  eklenti: 'baslangic',
  logo: 'gelisme',
  destek: 'gelisme',
  yatirimci: 'gelisme',
  'yapay-zeka': 'gelisme',
  'odeme-hatasi': 'gelisme',
  konferans: 'gelisme',
  stajyer: 'gelisme',
  kurumsal: 'final',
};

/** Aileler: aynı aileden iki kart aynı destede çıkmaz (HAVUZ-2026-11-21 §"havuz kuralları"). */
const KLASIK_AILE: Record<string, string> = {
  'ilk-musteri': 'kucuk-istek', // ↔ arama-kutusu: küçük istek, koca motor
  yatirimci: 'yatirimci', // ↔ demo-gunu
  'odeme-hatasi': 'para', // ↔ fiyat-yakinda: para alamamak
};

export const POOL: readonly PoolCard[] = [
  ...CARDS.map((c) => ({ ...c, stage: KLASIK_EVRE[c.id] as Stage, ...(KLASIK_AILE[c.id] ? { family: KLASIK_AILE[c.id] } : {}) })),
  ...NEW_CARDS,
];
