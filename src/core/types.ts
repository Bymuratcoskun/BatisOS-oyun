// BatışOS oyun çekirdeği — türler.
// Alan adları docs/kaynak/Mimari_sema.md "Oyun durumu modeli" tablosuyla birebir.
// Çekirdek DOM'a ve tarayıcı depolamasına erişmez.

/** Karne hesabında kullanılan karar kategorileri (README "Kurucu karnesi"). */
export const TAGS = ['altyapı', 'tanıtım', 'kendi_entegrasyonun'] as const;
export type Tag = (typeof TAGS)[number];

export interface Stats {
  cash: number;
  customers: number;
  morale: number;
}

export interface Option {
  id: string;
  text: string;
  effects: Stats;
  tags: readonly Tag[];
  log: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  options: readonly [Option, Option, Option];
}

export type Phase = 'start' | 'choosing' | 'result' | 'finished';
export type Outcome = 'ongoing' | 'won' | 'lost';
export type EndReason = 'cash_depleted' | 'customer_target_missed' | 'goals_met';

export interface DecisionRecord {
  turn: number; // 1'den başlar, ekrandaki tur numarası
  cardId: string;
  optionId: string;
  optionText: string;
  tags: readonly Tag[];
  before: Stats;
  after: Stats;
  /** Sınırlar uygulandıktan SONRA gerçekleşen değişim. */
  delta: Stats;
  log: string;
}

export interface GameState {
  phase: Phase;
  /** Aktif kartın sıfırdan başlayan sıra numarası. Ekranda turnIndex + 1. */
  turnIndex: number;
  cash: number;
  customers: number;
  morale: number;
  decisionHistory: readonly DecisionRecord[];
  outcome: Outcome;
  endReason: EndReason | null;
  /** "Suçu teknoloji yığınına at" ile açılan oyunun ilk günlük notu. */
  openingNote: string | null;
  /** v1.1: seçeneklerin ekran sırasının tohumu (Mimari_sema'da yok; K14). Kuralları etkilemez. */
  seed: number;
}

/** Çekirdeğin her işlemi ya yeni durum ya da nedenli ret döndürür; sessiz geçiş yok. */
export type Result =
  | { ok: true; state: GameState }
  | { ok: false; reason: string; state: GameState };
