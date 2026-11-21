// v1.2 yerel en iyi sonuç: yalnız bu tarayıcıda (hesap yok, sunucu yok). Saklanamazsa oyun çökmez,
// ekranda "bu tarayıcı sonuç saklamıyor" der (sessiz geçmez).
import type { GameState } from '../core/types.ts';

export interface Kayit {
  oynanan: number;
  kazanilan: number;
  /** Kazanılan oyunlarda en yüksek kalan kasa; hiç kazanılmadıysa null. */
  enIyiKasa: number | null;
}

export const ANAHTAR = 'batisos-kayit-v1';
export const BOS: Kayit = { oynanan: 0, kazanilan: 0, enIyiKasa: null };

/** Biten bir oyunu kayda işler (saf). Bitmemiş oyun kaydı değiştirmez. */
export function isle(k: Kayit, s: GameState): Kayit {
  if (s.phase !== 'finished') return k;
  const won = s.outcome === 'won';
  return {
    oynanan: k.oynanan + 1,
    kazanilan: k.kazanilan + (won ? 1 : 0),
    enIyiKasa: won ? Math.max(k.enIyiKasa ?? -Infinity, s.cash) : k.enIyiKasa,
  };
}

/** Saklanan metni okur; bozuk ya da eksikse boş kayıt (bozuk veri yanlış sayı göstermesin). */
export function coz(metin: string | null): Kayit {
  if (metin === null) return BOS;
  try {
    const o = JSON.parse(metin) as Partial<Kayit>;
    const tam = (n: unknown) => Number.isInteger(n) && (n as number) >= 0;
    if (!tam(o.oynanan) || !tam(o.kazanilan) || (o.kazanilan as number) > (o.oynanan as number)) return BOS;
    if (o.enIyiKasa !== null && !Number.isInteger(o.enIyiKasa)) return BOS;
    return { oynanan: o.oynanan!, kazanilan: o.kazanilan!, enIyiKasa: o.enIyiKasa ?? null };
  } catch {
    return BOS;
  }
}

type Depo = Pick<Storage, 'getItem' | 'setItem'>;

/** Tarayıcı deposu. Erişim hata verirse (özel pencere, engellenmiş site verisi) null: "saklanmıyor". */
export function depoAc(): Depo | null {
  try {
    const d = window.localStorage;
    const k = '__batisos_deneme__';
    d.setItem(k, '1');
    d.removeItem(k);
    return d;
  } catch {
    return null;
  }
}

export function oku(d: Depo): Kayit {
  try {
    return coz(d.getItem(ANAHTAR));
  } catch {
    return BOS;
  }
}

export function yaz(d: Depo, k: Kayit): boolean {
  try {
    d.setItem(ANAHTAR, JSON.stringify(k));
    return true;
  } catch {
    return false;
  }
}
