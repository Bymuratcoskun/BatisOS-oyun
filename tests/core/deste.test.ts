// v1.2 deste (K18): havuzdan oyun başına 12 kart. Ölçütler yazılmadan önce kod koşulmadı:
// aynı tohum → aynı deste · 4 başlangıç + 7 gelişme + 1 final, bu sırayla · tekrar yok · aynı aileden iki kart yok ·
// 1000 tohumda havuzun her kartı en az bir kez çıkar · kurulamazsa nedeniyle ret.
import { describe, expect, it } from 'vitest';
import { buildDeck } from '../../src/core/deck.ts';
import { initialState, newGame, RULES } from '../../src/core/new-game.ts';
import type { PoolCard } from '../../src/core/types.ts';
import { POOL } from '../../src/content/pool.ts';
import { validatePool } from '../../src/content/validate-cards.ts';
import { KLASIK_IDS } from '../helpers.ts';

const deste = (seed: number) => {
  const r = buildDeck(POOL, seed);
  if (!r.ok) throw new Error(r.reason);
  return r.deck;
};

describe('Deste (v1.2)', () => {
  it('havuz doğrulamadan geçer: 27 kart, hata yok', () => {
    expect(validatePool(POOL)).toEqual([]);
    expect(POOL).toHaveLength(27);
  });

  it('aynı tohum → aynı deste; farklı tohumlar farklı desteler verir', () => {
    for (let s = 0; s < 200; s++) expect(deste(s).map((c) => c.id)).toEqual(deste(s).map((c) => c.id));
    const farkli = new Set(Array.from({ length: 200 }, (_, s) => deste(s).map((c) => c.id).join(',')));
    expect(farkli.size).toBeGreaterThan(190); // 200 tohumda birkaç çakışma olabilir; çoğu farklı olmalı
  });

  it('1000 tohumda: 12 kart, evre sırası 4/7/1, tekrar yok, aile çakışması yok', () => {
    const sira = [...Array(RULES.deckShape.baslangic).fill('baslangic'), ...Array(RULES.deckShape.gelisme).fill('gelisme'), 'final'];
    for (let s = 0; s < 1000; s++) {
      const d = deste(s);
      expect(d.map((c) => c.stage)).toEqual(sira);
      expect(new Set(d.map((c) => c.id)).size).toBe(12);
      const aileler = d.filter((c) => c.family).map((c) => c.family);
      expect(new Set(aileler).size, `tohum ${s}: aile çakışması ${aileler.join(',')}`).toBe(aileler.length);
    }
  });

  it('1000 tohumda havuzun her kartı en az bir kez çıkar (rapor: en az ve en çok çıkan)', () => {
    const say = new Map<string, number>(POOL.map((c) => [c.id, 0]));
    for (let s = 0; s < 1000; s++) for (const c of deste(s)) say.set(c.id, say.get(c.id)! + 1);
    const sirali = [...say.entries()].sort((a, b) => a[1] - b[1]);
    console.log(`DENGE deste_kapsama tohum=1000 en_az=${sirali[0]![0]}:${sirali[0]![1]} en_cok=${sirali.at(-1)![0]}:${sirali.at(-1)![1]}`);
    expect(sirali.filter(([, n]) => n === 0)).toEqual([]);
  });

  it('negatif kontrol: final kartı kalmayan havuz nedeniyle reddedilir', () => {
    const eksik: PoolCard[] = POOL.filter((c) => c.stage !== 'final');
    const r = buildDeck(eksik, 1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('"final" evresinde 1 kart gerekli');
    expect(validatePool(eksik)).toContain('"final" evresinde 0 kart var; deste 1 istiyor');
  });

  it('negatif kontrol: tanımsız evre ve tekrar eden kart kimliği adıyla yakalanır', () => {
    const c = JSON.parse(JSON.stringify(POOL)) as any[];
    c[0].stage = 'ara';
    c[1].id = c[2].id;
    const e = validatePool(c);
    expect(e.some((x) => x.includes('evre tanımsız (ara'))).toBe(true);
    expect(e.some((x) => x.includes('kimlik tekrar ediyor'))).toBe(true);
  });

  it('çekirdek 12 kartlık olmayan desteyle oyun açmaz (sessiz geçmez)', () => {
    const r = newGame(initialState(), 1, KLASIK_IDS.slice(0, 11));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('Deste 11 kart; tam olarak 12 olmalı');
    expect(newGame(initialState(), 1, KLASIK_IDS).ok).toBe(true);
  });
});
