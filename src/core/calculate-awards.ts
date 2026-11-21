import type { DecisionRecord, GameState, Tag } from './types.ts';

/**
 * Kurucu karnesi — README "Kurucu karnesi" tablosu (koşullar README ifadesiyle).
 * Karne YALNIZ karar geçmişinden ve bitiş sonucundan üretilir; ayrı sayaç tutulmaz.
 * Oyun sonucunu değiştirmez.
 */
export interface Award {
  id: string;
  title: string;
  quip: string;
}

export interface ReportCard {
  awards: Award[];
  turnsSurvived: number;
  infrastructureCount: number;
  lastSpend: string | null;
  investorComment: string;
}

export function countTag(history: readonly DecisionRecord[], tag: Tag): number {
  return history.filter((d) => d.tags.includes(tag)).length;
}

export function calculateAwards(state: GameState): Award[] {
  if (state.outcome === 'ongoing') return [];
  const h = state.decisionHistory;
  const awards: Award[] = [];

  // "En az 4 altyapı kararı almak ve oyunu 0 müşteriyle bitirmek"
  if (countTag(h, 'altyapı') >= 4 && state.customers === 0) {
    awards.push({
      id: 'mimar-sinan',
      title: 'Mimar Sinan, Gelir Sıfır',
      quip: 'Eserleriniz yüzyıllarca ayakta kalacak. Şirketiniz kalmadı.',
    });
  }
  // "API alternatifini kendin yazma seçeneğini seçmek ve oyunu kaybetmek"
  if (countTag(h, 'kendi_entegrasyonun') >= 1 && state.outcome === 'lost') {
    awards.push({
      id: 'acik-kaynak-fedaisi',
      title: 'Açık Kaynak Fedaisi',
      quip: '300 TL’ye boyun eğmediniz. Şimdi kimseye boyun eğecek bir şirketiniz de yok.',
    });
  }
  // "En az 3 tanıtım kararı almak ve oyunu 3'ten az müşteriyle bitirmek"
  if (countTag(h, 'tanıtım') >= 3 && state.customers < 3) {
    awards.push({
      id: 'sunum-unicornu',
      title: 'Sunum Unicorn’u',
      quip: 'Slaytlarınız 1 milyar dolar değerinde. Banka hesabınız slayt değil.',
    });
  }
  // "Kazanma koşullarını sağlamak"
  if (state.outcome === 'won') {
    awards.push({
      id: 'istemeden-ceo',
      title: 'İstemeden CEO',
      quip: 'Müşteriyle konuştunuz, istediğini yaptınız, parasını aldınız. Mühendis dostlarınız sizi artık tanımıyor.',
    });
  }
  return awards;
}

function investorComment(state: GameState, infra: number): string {
  if (state.endReason === 'goals_met') {
    return '“Müşteriyle konuşmak işe yaramış. Bunu kimseye söylemeyin, sektör bozulur.”';
  }
  if (state.endReason === 'customer_target_missed') {
    return '“Kasada para var, müşteri yok. Bu bir şirket değil, kumbara.”';
  }
  if (infra >= 4) return '“Keşke bir kere para almayı deneseydiniz.”';
  return '“Parayı bu hızla yakmanın tek daha hızlı yolu sobaydı. Onu da kendiniz yazardınız.”';
}

export function buildReportCard(state: GameState): ReportCard {
  const h = state.decisionHistory;
  const infra = countTag(h, 'altyapı');
  const spends = h.filter((d) => d.delta.cash < 0);
  const last = spends[spends.length - 1];
  return {
    awards: calculateAwards(state),
    turnsSurvived: h.length,
    infrastructureCount: infra,
    lastSpend: last === undefined ? null : last.optionText,
    investorComment: investorComment(state, infra),
  };
}
