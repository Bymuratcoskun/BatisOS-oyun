// README "Kurucu karnesi" — her unvan ayrı ayrı, birden fazla unvan, unvansız sonuç.
// Dizilerin yanındaki hesaplar elle yapıldı; test onları ölçer.
import { describe, expect, it } from 'vitest';
import { buildReportCard, calculateAwards } from '../../src/core/calculate-awards.ts';
import { restart } from '../../src/core/new-game.ts';
import { CARDS } from '../../src/content/cards.ts';
import { EARLY_BUST, must, play, WIN, KLASIK_IDS } from '../helpers.ts';

const ids = (s: Parameters<typeof calculateAwards>[0]) => calculateAwards(s).map((a) => a.id);

describe('Kurucu karnesi', () => {
  it('İstemeden CEO: kazanma koşulları sağlanınca', () => {
    const s = play(CARDS, WIN);
    expect(s.outcome).toBe('won');
    expect(ids(s)).toEqual(['istemeden-ceo']);
  });

  it('Mimar Sinan + Açık Kaynak Fedaisi birlikte (birden fazla unvan)', () => {
    // 100 −30 −15 −25 −22 −18 = −10 bin; 5 altyapı, 0 müşteri, kendi entegrasyonu
    const s = play(CARDS, EARLY_BUST);
    expect(s).toMatchObject({ outcome: 'lost', endReason: 'cash_depleted', customers: 0, cash: -10_000 });
    expect(ids(s)).toEqual(['mimar-sinan', 'acik-kaynak-fedaisi']);
  });

  it('Mimar Sinan tek başına: altyapı ≥ 4, 0 müşteri, kendi entegrasyonu yok', () => {
    // 100 −30 −0,3 −25 −22 −18 −20 = −15,3 bin → 6. turda batış
    const s = play(CARDS, ['bicim', 'ode', 'rust', 'cekirdek', 'tasarim-sistemi', 'kimlik']);
    expect(s).toMatchObject({ outcome: 'lost', customers: 0, cash: -15_300 });
    expect(ids(s)).toEqual(['mimar-sinan']);
  });

  it('Sunum Unicorn’u: tanıtım ≥ 3, müşteri < 3 (altyapı 4 ama müşteri 1 → Mimar Sinan yok)', () => {
    // 100 −20 −0,3 −3 −0 −6 −2 −8 −35 −25 −9 = −8,3 bin → 10. turda batış; müşteri 1
    const s = play(CARDS, ['motor', 'ode', 'demo', 'ertele', 'animasyon', 'discord', 'sunum', 'model', 'yeniden', 'cati']);
    expect(s).toMatchObject({ outcome: 'lost', customers: 1, cash: -8_300 });
    expect(ids(s)).toEqual(['sunum-unicornu']);
  });

  it('3 altyapı Mimar Sinan’a yetmez (sınır)', () => {
    // bicim, rust, model = 3 altyapı; 100 −30 −0,3 −25 −0 −6 −2 −8 −35 = −6,3 bin
    const s = play(CARDS, ['bicim', 'ode', 'rust', 'ertele', 'animasyon', 'discord', 'sunum', 'model']);
    expect(s).toMatchObject({ outcome: 'lost', customers: 0, cash: -6_300 });
    expect(ids(s)).not.toContain('mimar-sinan');
  });

  it('Kazanmak Açık Kaynak Fedaisi vermez (README koşulu: kaybetmek)', () => {
    const seq = [...WIN];
    seq[1] = 'kendimiz';
    const s = play(CARDS, seq);
    expect(s.outcome).toBe('won');
    expect(ids(s)).toEqual(['istemeden-ceo']);
  });

  it('Unvansız sonuç: koşul yoksa zorunlu unvan verilmez', () => {
    // müşteri 3+2+2+1+1 = 9 (<10), kasa 23,7 bin, altyapı 2, tanıtım 4 ama müşteri ≥ 3
    const s = play(CARDS, ['csv', 'ode', 'konus', 'ertele', 'odeme-sayfasi', 'discord', 'sunum', 'model', 'duzelt', 'cati', 'belge', 'video']);
    expect(s).toMatchObject({ outcome: 'lost', endReason: 'customer_target_missed', customers: 9, cash: 23_700 });
    expect(ids(s)).toEqual([]);
  });

  it('Önceki oyunun unvanları yeni oyuna taşınmaz', () => {
    const fin = play(CARDS, EARLY_BUST);
    expect(ids(fin).length).toBeGreaterThan(0);
    expect(ids(must(restart(fin, true, 1, KLASIK_IDS)))).toEqual([]);
  });

  it('Batış raporu karar geçmişinden: dayanılan tur, altyapı sayısı, son harcama', () => {
    const r = buildReportCard(play(CARDS, EARLY_BUST));
    expect(r).toMatchObject({ turnsSurvived: 5, infrastructureCount: 5, lastSpend: 'Önce bir tasarım sistemi kuralım' });
    expect(r.investorComment).toBe('“Keşke bir kere para almayı deneseydiniz.”');
  });
});
