// v1.2 adres: `#klasik` eski 12 kart; `#tohum-<sayı>` aynı deste ve aynı seçenek sırası (bağlantıyla paylaşım).
// Bozuk tohum sessizce yok sayılmaz: rastgele desteyle açılır ve nedeni ekranda söylenir.
import type { DeckMode } from './controller.ts';

export type HashChoice = { mode: DeckMode; seed?: number; notice?: string };

const TOHUM = /^#tohum-(.*)$/;

export function parseHash(hash: string): HashChoice {
  if (hash === '#klasik') return { mode: 'klasik' };
  const m = TOHUM.exec(hash);
  if (!m) return { mode: 'havuz' };
  const raw = m[1]!;
  if (/^\d{1,10}$/.test(raw) && Number(raw) < 2 ** 32) return { mode: 'havuz', seed: Number(raw) };
  return { mode: 'havuz', notice: `Bağlantıdaki tohum geçersiz ("${raw.slice(0, 20)}"); rastgele bir deste açıldı.` };
}

/** Paylaşılan bağlantı: havuzda bu oyunun tohumu, klasikte `#klasik`. */
export function shareLink(base: string, mode: DeckMode, seed: number): string {
  return mode === 'klasik' ? `${base}#klasik` : `${base}#tohum-${seed}`;
}
