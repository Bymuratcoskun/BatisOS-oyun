// v1.3 olay zincirleri (docs/raporlar/TASARIM-v1.3-zincirler.md, operatör onayı 2026-11-26).
// Kaynak kabul şartları (yol haritası önerisi §7): yalnız koşulu sağlanan zincir açılır · sonsuz döngü ya da
// 13. hafta yok · açıklanmayan ek borç yok. Ek: uyarı kesin söyler, söylediği gerçekleşir.
import { describe, expect, it } from 'vitest';
import { applyChoice, nextTurn, showResults } from '../../src/core/apply-choice.ts';
import { buildDeck } from '../../src/core/deck.ts';
import { CHAIN_RULES, cardAt, chainEpilogues, chainHints, followUpId } from '../../src/core/chains.ts';
import { applyEffects } from '../../src/core/effects.ts';
import { initialState, newGame, RULES } from '../../src/core/new-game.ts';
import { mulberry32 } from '../../src/core/rng.ts';
import { CHAIN_IDS, type Card, type GameState, type Option } from '../../src/core/types.ts';
import { CARDS } from '../../src/content/cards.ts';
import { POOL } from '../../src/content/pool.ts';
import { must, WIN } from '../helpers.ts';

type Secici = (card: Card, s: GameState) => Option;

/** Zincirli oyun: her hafta kart çekirdekten (cardAt) okunur, seçici seçer. */
function oyna(deck: readonly Card[], sec: Secici, chainsOn = true, seed = 1): GameState {
  let s = must(newGame(initialState(), seed, deck.map((c) => c.id), chainsOn));
  for (;;) {
    const card = cardAt(s, deck)!;
    s = must(applyChoice(s, deck, card.id, sec(card, s).id));
    if (s.outcome !== 'ongoing') return must(showResults(s));
    s = must(nextTurn(s, deck));
  }
}

const etiketli = (tag: string) => (c: Card) => c.options.find((o) => (o.tags as readonly string[]).includes(tag));
const etiketsiz = (c: Card) => c.options.find((o) => o.tags.length === 0)!;
const kart = (id: string) => POOL.find((c) => c.id === id)!;

/** WIN dizisi klasik destede; takip kartında ilk seçenek. */
const winSecici: Secici = (c) => c.options.find((o) => WIN.includes(o.id)) ?? c.options[0]!;

describe('v1.3 olay zincirleri', () => {
  it('A: ilk altyapı seçimi 3 hafta sonraki haftanın yerine bakım kartını koyar; kart kararı ve haftayı alıntılar', () => {
    const deck = (buildDeck(POOL, 7) as { deck: Card[] }).deck;
    let s = must(newGame(initialState(), 7, deck.map((c) => c.id), true));
    const secilen = etiketli('altyapı')(deck[0]!)!;
    s = must(applyChoice(s, deck, deck[0]!.id, secilen.id));
    expect(s.chains.filter((e) => e.chain === 'bakim')).toEqual([{ chain: 'bakim', turn: 1, quote: secilen.text, slot: 1 + CHAIN_RULES.delay }]);
    expect(s.deck[CHAIN_RULES.delay]).toBe(followUpId('bakim'));
    for (let w = 2; w <= 1 + CHAIN_RULES.delay; w++) {
      s = must(nextTurn(s, deck));
      if (w <= CHAIN_RULES.delay) s = must(applyChoice(s, deck, cardAt(s, deck)!.id, etiketsiz(cardAt(s, deck)!).id));
    }
    const k = cardAt(s, deck)!;
    expect(k.id).toBe(followUpId('bakim'));
    expect(k.title).toBe('O Şey Hâlâ Çalışıyor');
    expect(k.description).toContain('1. hafta');
    expect(k.description).toContain(secilen.text.replace(/[“”]/g, (q) => (q === '“' ? '‘' : '’')));
  });

  it('her zincir bir oyunda en fazla bir kez açılır (her hafta altyapı seçilse bile)', () => {
    const deck = (buildDeck(POOL, 3) as { deck: Card[] }).deck;
    const s = oyna(deck, (c) => etiketli('altyapı')(c) ?? c.options[0]!);
    expect(s.chains.filter((e) => e.chain === 'bakim')).toHaveLength(1);
  });

  it('B: tanıtım sözü açar; tek seçenek iki zinciri açarsa ikincisi bir sonraki haftaya kayar (konferans/çatı)', () => {
    const ids = ['konferans', 'eklenti', 'api-faturasi', 'ilk-musteri', 'logo', 'destek', 'yatirimci', 'yapay-zeka', 'odeme-hatasi', 'stajyer', 'testler-yesil', 'kurumsal'];
    const deck = ids.map(kart);
    let s = must(newGame(initialState(), 1, ids, true));
    const ipucu = chainHints(s, deck[0]!.options.find((o) => o.id === 'cati')!);
    s = must(applyChoice(s, deck, 'konferans', 'cati'));
    expect(s.chains.map((e) => [e.chain, e.slot])).toEqual([['bakim', 4], ['soz', 5]]);
    expect(ipucu.map((i) => [i.chain, i.slot])).toEqual([['bakim', 4], ['soz', 5]]);
    expect(ipucu.map((i) => i.text)).toEqual(['3 hafta sonra bakım ister.', '4 hafta sonra bu söz hatırlatılır.']);
    expect(s.deck.slice(3, 5)).toEqual([followUpId('bakim'), followUpId('soz')]);
  });

  it(`C: müşteri ilk kez ${CHAIN_RULES.teslimEsigi}'yı bulunca teslim kartı gelir; kart güncel müşteri sayısını söyler`, () => {
    const s = oyna(CARDS, winSecici);
    const c = s.chains.find((e) => e.chain === 'teslim')!;
    const tetik = s.decisionHistory[c.turn - 1]!;
    expect(tetik.after.customers).toBeGreaterThanOrEqual(CHAIN_RULES.teslimEsigi);
    expect(tetik.before.customers).toBeLessThan(CHAIN_RULES.teslimEsigi);
    expect(c.slot).toBe(c.turn + CHAIN_RULES.delay);
    const oynanan = s.decisionHistory[c.slot! - 1]!;
    expect(oynanan.cardId).toBe(followUpId('teslim'));
  });

  it('geç tetik (9. haftadan sonra) takip kartı getirmez; sonuç ekranında son söz olur; final asla yerinden çıkmaz', () => {
    // Klasik destede 9. hafta "odeme-hatasi": orada altyapı seç, öbür haftalar WIN.
    const s = oyna(CARDS, (c) => (c.id === 'odeme-hatasi' ? c.options.find((o) => o.id === 'yeniden')! : winSecici(c, initialState())));
    const a = s.chains.find((e) => e.chain === 'bakim')!;
    expect(a).toMatchObject({ turn: 9, slot: null, quote: 'Ödeme ekranını yeniden yaz' });
    expect(s.deck[RULES.turns - 1]).toBe('kurumsal');
    expect(s.decisionHistory).toHaveLength(RULES.turns);
    expect(chainEpilogues(s)).toContain('“Ödeme ekranını yeniden yaz” kararının bakım faturası bir sonraki kurucuya kaldı.');
    // Uyarı da bunu söylemişti: takip kartı değil, sonuç ekranı.
  });

  it('oyun erken biterse planlanmış ama oynanmamış takip kartı son söze döner', () => {
    const o = (id: string, cash: number, tags: Option['tags']): Option => ({ id, text: `Metin ${id}`, effects: { cash, customers: 0, morale: 0 }, tags, log: id });
    const deck: Card[] = Array.from({ length: 12 }, (_, i) => ({
      id: `k${i}`,
      title: `K${i}`,
      description: 'd',
      options: [o('a', -1000, ['altyapı']), o('b', -200_000, []), o('c', 0, [])],
    }));
    let s = must(newGame(initialState(), 1, deck.map((c) => c.id), true));
    s = must(nextTurn(must(applyChoice(s, deck, 'k0', 'a')), deck));
    s = must(showResults(must(applyChoice(s, deck, 'k1', 'b'))));
    expect(s.endReason).toBe('cash_depleted');
    expect(chainEpilogues(s)).toEqual(['“Metin a” kararının bakım faturası bir sonraki kurucuya kaldı.']);
  });

  it('zincir kapalıyken (klasik) hiçbir zincir açılmaz, uyarı yok, 12 kart eski sırasıyla', () => {
    const s = oyna(CARDS, (c) => etiketli('altyapı')(c) ?? c.options[0]!, false);
    expect(s.chains).toEqual([]);
    expect(s.decisionHistory.map((d) => d.cardId)).toEqual(CARDS.slice(0, s.decisionHistory.length).map((c) => c.id));
    expect(chainHints(must(newGame(initialState(), 1, CARDS.map((c) => c.id))), CARDS[0]!.options[1]!)).toEqual([]);
  });

  it('özellik: 300 deste × 20 rastgele oyun — 12 hafta, final yerinde, zincir ≤ 1, uyarı = gerçekleşen, gizli borç yok, boş yer tutucu yok', () => {
    const rnd = mulberry32(2026_11_26);
    const hatalar: string[] = [];
    let ates = 0;
    for (let seed = 0; seed < 300; seed++) {
      const deck = (buildDeck(POOL, seed) as { deck: Card[] }).deck;
      for (let g = 0; g < 20; g++) {
        let s = must(newGame(initialState(), seed, deck.map((c) => c.id), true));
        const soz: { chain: string; slot: number | null; turn: number }[] = [];
        for (;;) {
          const card = cardAt(s, deck)!;
          if (/[{}]/.test(card.title + card.description + card.options.map((x) => x.text + x.log).join(''))) hatalar.push(`tohum ${seed}: "${card.id}" metninde doldurulmamış yer tutucu`);
          const opt = card.options[Math.floor(rnd() * 3)]!;
          for (const h of chainHints(s, opt)) soz.push({ chain: h.chain, slot: h.slot, turn: s.turnIndex + 1 });
          const before = { cash: s.cash, customers: s.customers, morale: s.morale };
          s = must(applyChoice(s, deck, card.id, opt.id));
          const d = s.decisionHistory.at(-1)!;
          const beklenen = applyEffects(before, opt.effects);
          if (JSON.stringify(d.after) !== JSON.stringify(beklenen)) hatalar.push(`tohum ${seed} hafta ${d.turn}: etki seçenekte yazandan farklı`);
          if (s.outcome !== 'ongoing') break;
          s = must(nextTurn(s, deck));
        }
        if (s.deck.length !== RULES.turns || s.decisionHistory.length > RULES.turns) hatalar.push(`tohum ${seed}: deste/geçmiş 12'yi aştı`);
        if (s.deck[RULES.turns - 1] !== deck[RULES.turns - 1]!.id) hatalar.push(`tohum ${seed}: final yerinden çıktı`);
        for (const z of CHAIN_IDS) if (s.chains.filter((e) => e.chain === z).length > 1) hatalar.push(`tohum ${seed}: ${z} iki kez`);
        const gercek = s.chains.map((e) => ({ chain: e.chain, slot: e.slot, turn: e.turn }));
        if (JSON.stringify(gercek) !== JSON.stringify(soz)) hatalar.push(`tohum ${seed}: uyarı ${JSON.stringify(soz)} ≠ gerçek ${JSON.stringify(gercek)}`);
        for (const e of s.chains) {
          if (e.slot === null) continue;
          ates++;
          const oynanan = s.decisionHistory[e.slot - 1];
          if (oynanan !== undefined && oynanan.cardId !== followUpId(e.chain)) hatalar.push(`tohum ${seed}: ${e.chain} ${e.slot}. haftada gelmedi`);
        }
      }
    }
    expect(hatalar.slice(0, 5)).toEqual([]);
    expect(ates).toBeGreaterThan(0); // test boş geçmesin
  });
});
