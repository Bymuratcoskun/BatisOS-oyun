import { RULES } from '../core/new-game.ts';
import { TAGS, type Card } from '../core/types.ts';

/**
 * İçerik doğrulama — README "İçerik doğrulama" listesi.
 * Eksik alan sessizce sıfır sayılmaz: her hata hangi kartta, hangi alanda olduğunu söyler.
 * Girdi `unknown` alınır; tür sistemi kandırılsa bile çalışma anında denetlenir.
 */
export function validateCards(input: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(input)) return ['Kart seti bir dizi değil'];
  if (input.length !== RULES.turns) {
    errors.push(`Kart sayısı ${input.length}; tam olarak ${RULES.turns} olmalı`);
  }

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
  return errors;
}

function nonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}
