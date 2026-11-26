import { buildDeck } from '../core/deck.ts';
import { RULES } from '../core/new-game.ts';
import { STAGES, TAGS, type Card, type PoolCard } from '../core/types.ts';
import type { ChainTemplate } from './chains.ts';

/**
 * İçerik doğrulama — README "İçerik doğrulama" listesi.
 * Eksik alan sessizce sıfır sayılmaz: her hata hangi kartta, hangi alanda olduğunu söyler.
 * Girdi `unknown` alınır; tür sistemi kandırılsa bile çalışma anında denetlenir.
 */
export function validateCards(input: unknown): string[] {
  if (!Array.isArray(input)) return ['Kart seti bir dizi değil'];
  const errors: string[] = [];
  if (input.length !== RULES.turns) {
    errors.push(`Kart sayısı ${input.length}; tam olarak ${RULES.turns} olmalı`);
  }
  checkCards(input, errors);
  return errors;
}

/**
 * v1.2 havuz doğrulaması: her kart `validateCards`'ın kart kurallarından geçer; ayrıca evre geçerli,
 * deste biçimi `turns`'e eşit, her evrede yeterli kart var ve 100 tohumda gerçekten deste kuruluyor.
 */
export function validatePool(input: unknown): string[] {
  if (!Array.isArray(input)) return ['Kart havuzu bir dizi değil'];
  const errors: string[] = [];
  checkCards(input, errors);
  const shape = RULES.deckShape;
  const toplam = STAGES.reduce((a, e) => a + shape[e], 0);
  if (toplam !== RULES.turns) errors.push(`Deste biçimi ${toplam} kart; tur sayısı ${RULES.turns}`);
  input.forEach((raw: unknown, i: number) => {
    const c = raw as Partial<PoolCard> | null;
    const where = `havuz[${i + 1}]${typeof c?.id === 'string' ? ` "${c.id}"` : ''}`;
    if (c === null || typeof c !== 'object') return; // checkCards zaten yazdı
    if (!(STAGES as readonly unknown[]).includes(c.stage)) errors.push(`${where}: evre tanımsız (${String(c.stage)}; tanımlılar: ${STAGES.join(', ')})`);
    if (c.family !== undefined && !nonEmpty(c.family)) errors.push(`${where}: aile boş`);
  });
  for (const e of STAGES) {
    const n = input.filter((c: Partial<PoolCard> | null) => c?.stage === e).length;
    if (n < shape[e]) errors.push(`"${e}" evresinde ${n} kart var; deste ${shape[e]} istiyor`);
  }
  if (errors.length === 0) {
    for (let seed = 0; seed < 100; seed++) {
      const r = buildDeck(input as PoolCard[], seed);
      if (!r.ok) {
        errors.push(r.reason);
        break;
      }
    }
  }
  return errors;
}

function checkCards(input: readonly unknown[], errors: string[]): void {
  const seenCardIds = new Set<string>();
  input.forEach((raw: unknown, i: number) => {
    const card = raw as Partial<Card> | null;
    const where = `kart[${i + 1}]${typeof card?.id === 'string' ? ` "${card.id}"` : ''}`;
    if (card === null || typeof card !== 'object') {
      errors.push(`${where}: nesne değil`);
      return;
    }
    if (!nonEmpty(card.id)) errors.push(`${where}: kimlik boş`);
    else if (seenCardIds.has(card.id)) errors.push(`${where}: kimlik tekrar ediyor`);
    else seenCardIds.add(card.id);
    if (!nonEmpty(card.title)) errors.push(`${where}: başlık boş`);
    if (!nonEmpty(card.description)) errors.push(`${where}: açıklama boş`);

    if (!Array.isArray(card.options)) {
      errors.push(`${where}: seçenek listesi yok`);
      return;
    }
    if (card.options.length !== 3) {
      errors.push(`${where}: ${card.options.length} seçenek var; tam olarak 3 olmalı`);
    }
    const seenOptionIds = new Set<string>();
    card.options.forEach((rawOpt: unknown, j: number) => {
      const opt = rawOpt as Record<string, unknown> | null;
      const ow = `${where} seçenek[${j + 1}]${typeof opt?.['id'] === 'string' ? ` "${opt['id']}"` : ''}`;
      if (opt === null || typeof opt !== 'object') {
        errors.push(`${ow}: nesne değil`);
        return;
      }
      const id = opt['id'];
      if (!nonEmpty(id)) errors.push(`${ow}: kimlik boş`);
      else if (seenOptionIds.has(id)) errors.push(`${ow}: kimlik kart içinde tekrar ediyor`);
      else seenOptionIds.add(id);
      if (!nonEmpty(opt['text'])) errors.push(`${ow}: metin boş`);
      if (!nonEmpty(opt['log'])) errors.push(`${ow}: günlük metni boş`);

      const eff = opt['effects'] as Record<string, unknown> | null | undefined;
      if (eff === null || typeof eff !== 'object') {
        errors.push(`${ow}: etkiler yok`);
      } else {
        for (const key of ['cash', 'customers', 'morale'] as const) {
          if (!Number.isInteger(eff[key])) errors.push(`${ow}: etkiler.${key} tam sayı değil (${String(eff[key])})`);
        }
      }

      const tags = opt['tags'];
      if (!Array.isArray(tags)) {
        errors.push(`${ow}: etiket listesi yok`);
      } else {
        for (const t of tags) {
          if (!(TAGS as readonly unknown[]).includes(t)) {
            errors.push(`${ow}: tanımsız etiket "${String(t)}" (tanımlılar: ${TAGS.join(', ')})`);
          }
        }
      }
    });
  });
}

function nonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * v1.3 takip kartları: kart kuralları (checkCards) + yer tutucular yalnız tanımlı adlardan + kimlikler havuzla
 * çakışmaz. Tanımsız yer tutucu ekranda "{xyz}" diye kalırdı; burada adıyla kırmızıdır.
 */
export function validateChainTemplates(templates: Readonly<Record<string, ChainTemplate>>, pool: readonly Card[]): string[] {
  const errors: string[] = [];
  const list = Object.entries(templates);
  checkCards(list.map(([, t]) => t.card), errors);
  const havuz = new Set(pool.map((c) => c.id));
  const yer = (where: string, text: string, izinli: readonly string[]) => {
    for (const m of text.matchAll(/\{([^}]*)\}/g)) {
      if (!izinli.includes(m[1]!)) errors.push(`${where}: tanımsız yer tutucu {${m[1]}} (tanımlılar: ${izinli.join(', ')})`);
    }
  };
  for (const [id, t] of list) {
    const w = `zincir "${id}"`;
    if (havuz.has(t.card.id)) errors.push(`${w}: kart kimliği "${t.card.id}" havuzda da var`);
    const kart = ['hafta', 'karar', 'musteri'] as const;
    yer(`${w} başlık`, t.card.title, kart);
    yer(`${w} açıklama`, t.card.description, kart);
    t.card.options.forEach((o) => {
      yer(`${w} seçenek "${o.id}" metni`, o.text, kart);
      yer(`${w} seçenek "${o.id}" günlüğü`, o.log, kart);
    });
    yer(`${w} son söz`, t.epilogue, ['karar', 'musteri']);
    yer(`${w} uyarı`, t.hintSlot, ['gun', 'esik']);
    yer(`${w} uyarı (yer yok)`, t.hintEnd, ['esik']);
    for (const [ad, metin] of [['son söz', t.epilogue], ['uyarı', t.hintSlot], ['uyarı (yer yok)', t.hintEnd]] as const) {
      if (!nonEmpty(metin)) errors.push(`${w}: ${ad} boş`);
    }
  }
  return errors;
}
