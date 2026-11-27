// v1.2 adres: `#klasik` eski 12 kart; `#tohum-<sayı>` aynı deste ve aynı seçenek sırası (bağlantıyla paylaşım).
// Bozuk tohum sessizce yok sayılmaz: rastgele desteyle açılır ve nedeni ekranda söylenir.
// v1.4: İngilizce paylaşılan bağlantı `?lang=en` taşır (arkadaş da İngilizce açsın); Türkçe bağlantı değişmedi.
import type { DeckMode } from './controller.ts';
import type { Dil } from '../i18n/dil.ts';

export type HashChoice = { mode: DeckMode; seed?: number; notice?: string; /** v1.4: bozuk tohumun kendisi (uyarı seçilen dilde yazılsın) */ gecersiz?: string };

const TOHUM = /^#tohum-(.*)$/;

export function parseHash(hash: string): HashChoice {
  if (hash === '#klasik') return { mode: 'klasik' };
  const m = TOHUM.exec(hash);
  if (!m) return { mode: 'havuz' };
  const raw = m[1]!;
  if (/^\d{1,10}$/.test(raw) && Number(raw) < 2 ** 32) return { mode: 'havuz', seed: Number(raw) };
  const kisa = raw.slice(0, 20);
  return { mode: 'havuz', notice: `Bağlantıdaki tohum geçersiz ("${kisa}"); rastgele bir deste açıldı.`, gecersiz: kisa };
}

/** Paylaşılan bağlantı: havuzda bu oyunun tohumu, klasikte `#klasik`. */
export function shareLink(base: string, mode: DeckMode, seed: number, dil: Dil = 'tr'): string {
  const b = dil === 'en' ? `${base}?lang=en` : base;
  return mode === 'klasik' ? `${b}#klasik` : `${b}#tohum-${seed}`;
}
