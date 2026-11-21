// v1.1 paylaşılan sonuç metni: sonuç ekranıyla aynı işlevlerden, kimliksiz, oyun adresiyle.
import { describe, expect, it } from 'vitest';
import { CARDS } from '../../src/content/cards.ts';
import { shareText } from '../../src/ui/render.ts';
import { EARLY_BUST, play, WIN } from '../helpers.ts';
import pkg from '../../package.json' with { type: 'json' };

describe('Paylaşılan sonuç metni', () => {
  it('erken batış: başlık, neden, göstergeler, unvanlar, adres', () => {
    expect(shareText(play(CARDS, EARLY_BUST), 'klasik')).toBe(
      [
        `BatışOS v${pkg.version} — ŞİRKET KAPANDI`,
        'Şirketiniz 5. haftada kapandı: kasa tükendi.',
        'Kasa −10.000 TL · Müşteri 0 / 10 · Moral 100 / 100 · Altyapı kararı 5',
        'Unvanlar: Mimar Sinan, Gelir Sıfır; Açık Kaynak Fedaisi',
        `Sen de batır: ${pkg.homepage}#klasik`,
      ].join('\n'),
    );
  });

  it('kazanma: sonuç ekranındaki değerlerle aynı', () => {
    const t = shareText(play(CARDS, WIN), 'klasik');
    expect(t).toContain('ŞİRKET AYAKTA');
    expect(t).toContain('Kasa 73.700 TL · Müşteri 22 / 10');
    expect(t).toContain('· Altyapı kararı 0');
    expect(t).toContain('Unvanlar: İstemeden CEO');
  });

  it('adres yayın adresidir ve https', () => {
    expect(pkg.homepage).toMatch(/^https:\/\/.+\/$/);
  });
});

describe('Paylaşılan bağlantı (v1.2)', () => {
  it('havuz oyununda bağlantı bu oyunun tohumunu taşır: arkadaşın aynı desteyi oynar', () => {
    const s = { ...play(CARDS, EARLY_BUST), seed: 987654 };
    expect(shareText(s, 'havuz').split('\n').at(-1)).toBe(`Sen de batır: ${pkg.homepage}#tohum-987654`);
  });
});
