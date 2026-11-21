// v1.2 (K20): bağlantıyla aynı deste (`#tohum-N`) ve yerel en iyi sonuç. Saf işlevler; tarayıcı yok.
import { describe, expect, it } from 'vitest';
import { BOS, coz, isle } from '../../src/app/kayit.ts';
import { parseHash, shareLink } from '../../src/app/url.ts';
import { CARDS } from '../../src/content/cards.ts';
import { EARLY_BUST, play, started, WIN } from '../helpers.ts';

describe('Adres (#klasik, #tohum-N)', () => {
  it('geçerli adresler', () => {
    expect(parseHash('')).toEqual({ mode: 'havuz' });
    expect(parseHash('#klasik')).toEqual({ mode: 'klasik' });
    expect(parseHash('#tohum-0')).toEqual({ mode: 'havuz', seed: 0 });
    expect(parseHash('#tohum-12345')).toEqual({ mode: 'havuz', seed: 12345 });
    expect(parseHash('#tohum-4294967295')).toEqual({ mode: 'havuz', seed: 4294967295 });
    expect(parseHash('#baska')).toEqual({ mode: 'havuz' });
  });

  it('bozuk tohum sessizce yok sayılmaz: rastgele deste + uyarı', () => {
    for (const h of ['#tohum-', '#tohum-abc', '#tohum-4294967296', '#tohum--5', '#tohum-1.5', '#tohum-12345678901']) {
      const r = parseHash(h);
      expect(r.mode).toBe('havuz');
      expect(r.seed, h).toBeUndefined();
      expect(r.notice, h).toMatch(/^Bağlantıdaki tohum geçersiz/);
    }
  });

  it('paylaşılan bağlantı: havuzda tohum, klasikte #klasik', () => {
    expect(shareLink('https://x.test/oyun/', 'havuz', 42)).toBe('https://x.test/oyun/#tohum-42');
    expect(shareLink('https://x.test/oyun/', 'klasik', 42)).toBe('https://x.test/oyun/#klasik');
    // Bağlantıdaki tohum geri çözülünce aynı tohum çıkar (gidiş-dönüş).
    expect(parseHash(new URL(shareLink('https://x.test/', 'havuz', 3_000_000_000)).hash).seed).toBe(3_000_000_000);
  });
});

describe('Yerel kayıt', () => {
  it('biten oyunlar işlenir: kazanma, kayıp, en iyi kasa', () => {
    let k = BOS;
    k = isle(k, play(CARDS, EARLY_BUST));
    expect(k).toEqual({ oynanan: 1, kazanilan: 0, enIyiKasa: null });
    k = isle(k, play(CARDS, WIN));
    expect(k).toEqual({ oynanan: 2, kazanilan: 1, enIyiKasa: 73_700 });
    k = isle(k, { ...play(CARDS, WIN), cash: 10_000 });
    expect(k.enIyiKasa).toBe(73_700); // daha düşük kasa en iyiyi bozmaz
  });

  it('bitmemiş oyun kaydı değiştirmez', () => {
    expect(isle(BOS, started())).toBe(BOS);
  });

  it('bozuk ya da tutarsız saklanmış veri yanlış sayı göstermez (boş kayıt)', () => {
    expect(coz(null)).toEqual(BOS);
    expect(coz('{bozuk')).toEqual(BOS);
    expect(coz('{"oynanan":2,"kazanilan":3,"enIyiKasa":null}')).toEqual(BOS); // kazanma > oyun
    expect(coz('{"oynanan":-1,"kazanilan":0,"enIyiKasa":null}')).toEqual(BOS);
    expect(coz('{"oynanan":2,"kazanilan":1,"enIyiKasa":"çok"}')).toEqual(BOS);
    expect(coz('{"oynanan":2,"kazanilan":1,"enIyiKasa":5000}')).toEqual({ oynanan: 2, kazanilan: 1, enIyiKasa: 5000 });
  });
});
