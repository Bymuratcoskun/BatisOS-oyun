// v1.4 rehber kapısı. Türetilmiş dosya bayatlar (CLAUDE.md §4): REHBER.md / GUIDE.md, src/i18n/rehber.ts'ten
// üretilenle birebir aynı olmalı. İki dil aynı bölümleri aynı sırayla taşır. Rehberin sayıları oyunun kendi
// kurallarından gelir (elle yazılmış "12 hafta" kural değişince yalan söyler).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import pkg from '../../package.json' with { type: 'json' };
import { CHAIN_RULES } from '../../src/core/chains.ts';
import { RULES } from '../../src/core/new-game.ts';
import { REHBER_DOSYALARI, rehber, rehberMarkdown } from '../../src/i18n/rehber.ts';
import { TURKCE_HARF } from '../../src/i18n/dogrula.ts';

describe('v1.4 oyun rehberi', () => {
  it('depodaki REHBER.md ve GUIDE.md kaynaktan üretilenle aynı (bayatsa: tools/rehber-yaz)', () => {
    for (const [dil, dosya] of Object.entries(REHBER_DOSYALARI) as [keyof typeof REHBER_DOSYALARI, string][]) {
      expect(readFileSync(dosya, 'utf8'), `${dosya} bayat`).toBe(rehberMarkdown(dil, pkg.homepage));
    }
  });

  it('iki dil aynı bölümleri aynı sırayla, aynı blok biçimiyle taşır; İngilizcede Türkçe kalmadı', () => {
    const tr = rehber('tr');
    const en = rehber('en');
    expect(en.bolumler.map((b) => b.id)).toEqual(tr.bolumler.map((b) => b.id));
    tr.bolumler.forEach((b, i) => {
      const e = en.bolumler[i]!;
      expect(e.bloklar.map((k) => (typeof k === 'string' ? 'p' : k.length))).toEqual(b.bloklar.map((k) => (typeof k === 'string' ? 'p' : k.length)));
    });
    const izinli = (s: string) => s.replace(/BatışOS|Türkçe|#klasik|#tohum-\w+/g, '');
    const kalan = en.bolumler.flatMap((b) => [b.baslik, ...b.bloklar.flat()]).filter((s) => TURKCE_HARF.test(izinli(s)));
    expect(kalan).toEqual([]);
  });

  it('rehberin sayıları kurallardan: kural değişirse rehber de değişir', () => {
    const metin = (d: 'tr' | 'en') => rehberMarkdown(d, 'https://ornek.test/');
    expect(metin('tr')).toContain(`${RULES.turns}. haftanın sonunda`);
    expect(metin('en')).toContain(`end of week ${RULES.turns}`);
    expect(metin('tr')).toContain(`${CHAIN_RULES.teslimEsigi} müşteriye ulaştığında ${CHAIN_RULES.delay} hafta sonra`);
    expect(metin('en')).toContain(`reach ${CHAIN_RULES.teslimEsigi} customers, ${CHAIN_RULES.delay} weeks later`);
    expect(metin('en')).toContain('100,000 TL');
    expect(metin('tr')).toContain('100.000 TL');
  });
});
