// Arayüz: durumu gösterir, komut iletir. Kasa hesaplamaz, kazanma koşulu belirlemez.
// Bütün metinler textContent ile yazılır — HTML olarak yorumlanmaz (Kullanilacak_Teknolojiler).
import type { Command, DeckMode } from '../app/controller.ts';
import { CARD_SET_VERSION } from '../content/cards.ts';
import { POOL_VERSION } from '../content/pool.ts';
import type { Kayit } from '../app/kayit.ts';
import { shareLink } from '../app/url.ts';
import { buildReportCard } from '../core/calculate-awards.ts';
import { cardAt, chainEpilogues, chainHints } from '../core/chains.ts';
import { ZINCIR_VERSION } from '../content/chains.ts';
import { RULES } from '../core/new-game.ts';
import { optionOrder } from '../core/option-order.ts';
import type { Card, DecisionRecord, GameState, Stats } from '../core/types.ts';

type Child = Node | string | null | false;
type Attrs = Record<string, string | boolean | ((e: Event) => void)>;

function h(tag: string, attrs: Attrs = {}, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === 'function') el.addEventListener(k.replace(/^on/, ''), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false) el.setAttribute(k, v);
  }
  for (const c of children) {
    if (c === null || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

const MINUS = '−';
const nf = new Intl.NumberFormat('tr-TR');

export function money(n: number): string {
  return `${n < 0 ? MINUS : ''}${nf.format(Math.abs(n))} TL`;
}
/** Moral, kasa gibi gerçek eksi işaretiyle: −40 / 100 (K13). */
export function moraleText(n: number): string {
  return `${n < 0 ? MINUS : ''}${Math.abs(n)} / ${RULES.moraleMax}`;
}
function plain(n: number): string {
  return `${n < 0 ? MINUS : ''}${nf.format(Math.abs(n))}`;
}
function signed(n: number, unit = ''): string {
  if (n === 0) return 'Değişmedi';
  return `${n > 0 ? '+' : MINUS}${nf.format(Math.abs(n))}${unit}`;
}
/** Artış/azalış yalnız renkle değil, ok işareti ve metinle de anlatılır. */
function change(n: number, unit = ''): HTMLElement {
  const cls = n > 0 ? 'up' : n < 0 ? 'down' : 'same';
  const arrow = n > 0 ? '▲ ' : n < 0 ? '▼ ' : '= ';
  return h('span', { class: `chg ${cls}` }, arrow + signed(n, unit));
}
/**
 * v1.2 (YZ2): seçeneğin yazan etkisi ile gerçekleşen değişim farklıysa nedenini söyler
 * ("+15" yazıyordu, moral 100'de kesildi → "▲ +10 (sınır 100)"). Fark yoksa boş.
 */
export function limitNote(intended: number, actual: number, limit: number): string {
  return intended === actual ? '' : ` (sınır ${limit})`;
}

function effectsLine(e: Stats): HTMLElement {
  const part = (label: string, n: number, unit: string) =>
    h('span', { class: `fx ${n > 0 ? 'up' : n < 0 ? 'down' : 'same'}` }, `${label} ${n === 0 ? '0' : signed(n, unit)}`);
  return h('span', { class: 'fx-line' }, part('Kasa', e.cash, ' TL'), ' · ', part('Müşteri', e.customers, ''), ' · ', part('Moral', e.morale, ''));
}

function header(s: GameState, cards: readonly Card[]): HTMLElement {
  const week = s.phase === 'start' ? '—' : `Hafta ${s.turnIndex + 1} / ${cards.length}`;
  return h('header', { class: 'topbar' }, h('span', { class: 'logo' }, 'BATIŞ OS'), h('span', { 'data-testid': 'hafta' }, week));
}

function statsBar(s: GameState): HTMLElement {
  const stat = (label: string, value: string, id: string, warn = false) =>
    h('div', { class: `stat${warn ? ' warn' : ''}` }, h('span', { class: 'label' }, label), h('span', { class: 'value', 'data-testid': id }, value));
  return h(
    'section',
    { class: 'stats', 'aria-label': 'Göstergeler' },
    stat('Kasa', money(s.cash), 'kasa', s.cash < 20_000),
    stat('Ödeme yapan müşteri', `${s.customers} / ${RULES.customerTarget}`, 'musteri'),
    stat('Kurucu morali', moraleText(s.morale), 'moral'),
  );
}

function logEntries(s: GameState): HTMLElement {
  const items: HTMLElement[] = [...s.decisionHistory].reverse().map((d) => h('li', {}, h('span', { class: 'turn' }, `H${d.turn}`), ' ', d.log));
  if (s.openingNote !== null) items.push(h('li', { class: 'note' }, h('span', { class: 'turn' }, 'H0'), ' ', s.openingNote));
  return h(
    'section',
    { class: 'log', 'aria-label': 'Faaliyet günlüğü' },
    h('h2', {}, 'FAALİYET GÜNLÜĞÜ'),
    items.length ? h('ul', { 'data-testid': 'gunluk' }, ...items) : h('p', { class: 'muted' }, 'Henüz bir şey yapılmadı. Bu, şirket tarihimizin en kârlı dönemi.'),
  );
}

function startView(dispatch: (c: Command) => void, notice?: string): HTMLElement {
  return h(
    'section',
    { class: 'panel start' },
    h('h1', { tabindex: '-1' }, 'BatışOS'),
    notice ? h('p', { class: 'notice', role: 'status', 'data-testid': 'uyari' }, notice) : false,
    h('p', { class: 'tagline' }, 'Girişimini batmadan önce batır.'),
    h(
      'p',
      {},
      '12 hafta. 100.000 TL. Sıfır müşteri. Bir de “bunu baştan yazsak daha temiz olur” diye fısıldayan iç sesin.',
    ),
    h(
      'ul',
      { class: 'rules' },
      h('li', {}, 'Her hafta bir olay kartı açılır; üç karardan birini seçersin.'),
      h('li', {}, 'Kazanmak için 12. haftanın sonunda kasan 0 TL’nin üzerinde ve en az 10 ödeme yapan müşterin olmalı.'),
      h('li', {}, 'Kasa 0 TL’ye ya da altına düşerse şirket o anda kapanır.'),
      h('li', {}, 'Moral yüksek olabilir. Bu, şirketin iyi olduğu anlamına gelmez.'),
    ),
    h('button', { class: 'primary', onclick: () => dispatch({ type: 'new-game' }) }, 'Şirketi kur'),
    h('p', { class: 'muted small' }, 'Açılış animasyonu yatırım turundan sonra.'),
  );
}

function choosingView(s: GameState, cards: readonly Card[], dispatch: (c: Command) => void): HTMLElement {
  const card = cardAt(s, cards)!; // v1.3: takip kartı geldiyse o
  const buttons: HTMLButtonElement[] = [];
  const choose = (optionId: string) => {
    // Görsel kilit; asıl koruma çekirdekte (aşama + aktif kart denetimi).
    for (const b of buttons) b.disabled = true;
    dispatch({ type: 'choose', cardId: card.id, optionId });
  };
  // Ekran sırası tohumdan (v1.1); kimlikler ve kısayol tuşu ekrandaki konuma göre.
  optionOrder(s.seed, s.turnIndex).map((k) => card.options[k]!).forEach((o, i) => {
    const b = h(
      'button',
      { class: 'option', 'data-option': o.id, 'aria-keyshortcuts': String(i + 1), onclick: () => choose(o.id) },
      h('span', { class: 'key' }, String(i + 1)),
      h('span', { class: 'opt-text' }, o.text),
      effectsLine(o.effects),
      // v1.3: zinciri açacak seçenekte kesin uyarı; söylediği gerçekleşir (tests/core/zincir.test.ts)
      ...chainHints(s, o).map((z) => h('span', { class: 'chain-hint', 'data-testid': 'zincir-uyari' }, z.text)),
    ) as HTMLButtonElement;
    buttons.push(b);
  });
  return h(
    'section',
    { class: 'panel card', 'aria-labelledby': 'kart-baslik' },
    h('h1', { id: 'kart-baslik', tabindex: '-1', 'data-testid': 'kart-baslik' }, card.title),
    h('p', { class: 'desc' }, card.description),
    h('div', { class: 'options', role: 'group', 'aria-label': 'Kararlar' }, ...buttons),
  );
}

function resultView(s: GameState, cards: readonly Card[], dispatch: (c: Command) => void): HTMLElement {
  const d = s.decisionHistory[s.decisionHistory.length - 1]!;
  // Seçeneğin yazan etkisi (sınır notu için); bulunamazsa gerçekleşen değişim kullanılır, not çıkmaz.
  const yazan = cardAt(s, cards)?.options.find((o) => o.id === d.optionId)?.effects ?? d.delta;
  const notlu = (el: HTMLElement, note: string) => {
    if (note) el.append(h('span', { class: 'limit-note', 'data-testid': 'sinir-notu' }, note));
    return el;
  };
  const row = (label: string, before: string, after: string, delta: HTMLElement) =>
    h('tr', {}, h('th', { scope: 'row' }, label), h('td', {}, `${before} → ${after}`), h('td', {}, delta));
  const ended = s.outcome !== 'ongoing';
  return h(
    'section',
    { class: 'panel result', 'aria-live': 'polite' },
    h('h1', { tabindex: '-1' }, `KARAR: ${d.optionText}`),
    h(
      'table',
      { class: 'deltas', 'data-testid': 'degisimler' },
      h(
        'tbody',
        {},
        row('Kasa', money(d.before.cash), money(d.after.cash), change(d.delta.cash, ' TL')),
        row('Müşteri', String(d.before.customers), String(d.after.customers), notlu(change(d.delta.customers), limitNote(yazan.customers, d.delta.customers, 0))),
        row('Moral', plain(d.before.morale), plain(d.after.morale), notlu(change(d.delta.morale), limitNote(yazan.morale, d.delta.morale, RULES.moraleMax))),
      ),
    ),
    h('blockquote', { 'data-testid': 'sonuc-metni' }, d.log),
    ended && h('p', { class: 'alarm' }, s.endReason === 'cash_depleted' ? 'Kasada para kalmadı. Muhasebeci telefonu açmıyor.' : 'Son hafta bitti. Hesaplar kapanıyor…'),
    h(
      'button',
      { class: 'primary', onclick: () => dispatch(ended ? { type: 'show-results' } : { type: 'next-turn' }) },
      ended ? 'Sonuçları gör' : 'Sonraki hafta', // v1.2: üst çubukla aynı kelime (YZ2)
    ),
  );
}

function endReasonText(s: GameState): string {
  return s.endReason === 'goals_met'
    ? 'Kasa pozitif, müşteri hedefi tuttu. Kimse buna hazırlıklı değildi.'
    : s.endReason === 'cash_depleted'
      ? `Şirketiniz ${s.decisionHistory.length}. haftada kapandı: kasa tükendi.`
      : `12 hafta dayandınız ama yalnız ${s.customers} ödeme yapan müşteriniz var; hedef ${RULES.customerTarget}.`;
}

/**
 * v1.1 paylaşılan sonuç metni. Sonuç ekranıyla aynı işlevlerden üretilir; ayrı hesap yapmaz.
 * Kimlik, hesap, kişisel bilgi içermez.
 */
export function shareText(s: GameState, mode: DeckMode = 'havuz'): string {
  const r = buildReportCard(s);
  return [
    `BatışOS v${__SURUM__} — ${s.outcome === 'won' ? 'ŞİRKET AYAKTA' : 'ŞİRKET KAPANDI'}`,
    endReasonText(s),
    `Kasa ${money(s.cash)} · Müşteri ${s.customers} / ${RULES.customerTarget} · Moral ${moraleText(s.morale)} · Altyapı kararı ${r.infrastructureCount}`, // v1.2: altyapı sayısı (YZ2)
    r.awards.length ? `Unvanlar: ${r.awards.map((a) => a.title).join('; ')}` : 'Unvan yok. Vasatlık da bir başarıdır.',
    `Sen de batır: ${shareLink(__OYUN_ADRESI__, mode, s.seed)}`, // v1.2: bağlantı aynı desteyi açar
  ].join('\n');
}

/** Panoya kopyala; olmazsa sessiz geçme: nedenini söyle, metni seçilebilir göster. */
function copyBlock(text: string): HTMLElement {
  const status = h('p', { class: 'muted', role: 'status', 'data-testid': 'kopya-durum' });
  const wrap = h('div', { class: 'share' });
  const fallback = () => {
    status.textContent = 'Kopyalanamadı (tarayıcı izin vermedi). Metni aşağıdan seçip kopyalayabilirsiniz.';
    if (wrap.querySelector('textarea') === null) {
      const ta = h('textarea', { readonly: true, rows: '5', 'aria-label': 'Sonuç metni', 'data-testid': 'kopya-metni' }) as HTMLTextAreaElement;
      ta.value = text;
      wrap.append(ta);
      ta.select();
    }
  };
  const copy = () => {
    if (!navigator.clipboard?.writeText) return fallback();
    navigator.clipboard.writeText(text).then(() => {
      status.textContent = 'Sonuç panoya kopyalandı.';
    }, fallback);
  };
  wrap.prepend(h('button', { onclick: copy }, 'Sonucu kopyala'), status);
  return wrap;
}

function finishedView(s: GameState, dispatch: (c: Command) => void, mode: DeckMode, kayit: Kayit | null | undefined): HTMLElement {
  const r = buildReportCard(s);
  const won = s.outcome === 'won';
  const reason = endReasonText(s);
  const dl = (k: string, v: string, id?: string) => [h('dt', {}, k), h('dd', id ? { 'data-testid': id } : {}, v)];
  return h(
    'section',
    { class: `panel finished ${won ? 'won' : 'lost'}` },
    h('h1', { tabindex: '-1', 'data-testid': 'bitis-baslik' }, won ? 'ŞİRKET AYAKTA' : 'ŞİRKET KAPANDI'),
    h('p', { class: 'reason', 'data-testid': 'bitis-nedeni' }, reason),
    h(
      'dl',
      { class: 'report' },
      ...dl('Dayanılan süre', `${r.turnsSurvived} hafta`), // v1.2: "tur" değil "hafta" (YZ2)
      ...dl('Kalan kasa', money(s.cash), 'son-kasa'),
      ...dl('Ödeme yapan müşteri', String(s.customers), 'son-musteri'),
      ...dl('Kurucu morali', moraleText(s.morale)),
      ...dl('Alınan altyapı kararı', String(r.infrastructureCount)),
      ...dl(won ? 'Son imza' : 'Son harcama', r.lastSpend ?? 'Hiç harcama yapılmadı. Şüpheli.'), // v1.2: kazanınca "Son imza" (YZ2, operatör onayı)
    ),
    h('p', { class: 'investor' }, h('strong', {}, 'Yatırımcı yorumu: '), r.investorComment),
    h('h2', {}, 'KURUCU KARNESİ'),
    r.awards.length
      ? h('ul', { class: 'awards', 'data-testid': 'unvanlar' }, ...r.awards.map((a) => h('li', {}, h('strong', {}, a.title), h('span', {}, a.quip))))
      : h('p', { class: 'muted', 'data-testid': 'unvanlar' }, 'Bu oyunda özel bir unvan kazanılmadı. Vasatlık da bir başarıdır; sadece ödülü yoktur.'),
    // v1.3: açılıp takip kartı gelmemiş zincirler
    ...(() => {
      const son = chainEpilogues(s);
      return son.length ? [h('h2', {}, 'GERİDE KALANLAR'), h('ul', { class: 'epilogues', 'data-testid': 'son-soz' }, ...son.map((x) => h('li', {}, x)))] : [];
    })(),
    h('h2', { id: 'karar-ozeti' }, 'KARAR ÖZETİ'),
    // v1.1: harcama ve kalan kasa — oyuncu batışını adım adım görsün. Değerler yalnız karar geçmişinden.
    h(
      'table',
      { class: 'summary', 'aria-labelledby': 'karar-ozeti', 'data-testid': 'karar-ozeti' },
      h('thead', {}, h('tr', {}, ...['Hafta', 'Karar', 'Kasaya etkisi', 'Kalan kasa'].map((t) => h('th', { scope: 'col' }, t)))),
      h(
        'tbody',
        {},
        h('tr', {}, h('td', {}, '—'), h('td', {}, 'Başlangıç'), h('td', {}, ''), h('td', { class: 'num' }, money(RULES.startCash))),
        ...s.decisionHistory.map((d: DecisionRecord) =>
          h('tr', {}, h('td', {}, String(d.turn)), h('td', {}, d.optionText), h('td', { class: 'num' }, signed(d.delta.cash, ' TL')), h('td', { class: 'num' }, money(d.after.cash))),
        ),
      ),
    ),
    copyBlock(shareText(s, mode)),
    kayit === undefined ? false : h('p', { class: 'muted small', 'data-testid': 'kayit' }, kayitText(kayit)),
    h(
      'div',
      { class: 'restart' },
      h('button', { class: 'primary', onclick: () => dispatch({ type: 'restart', blameTech: false }) }, 'Yeniden dene'),
      h('button', { onclick: () => dispatch({ type: 'restart', blameTech: true }) }, 'Suçu teknoloji yığınına at'),
    ),
  );
}

/** Alt satırdaki sürüm: havuzda havuz sürümü, klasik destede kart seti (hata bildirimi hangi içerik olduğunu taşısın). */
export function versionText(mode: DeckMode): string {
  return mode === 'klasik' ? `v${__SURUM__} · ${CARD_SET_VERSION} · klasik` : `v${__SURUM__} · ${POOL_VERSION} · ${ZINCIR_VERSION}`;
}

/** v1.2: yerel kayıt satırı. null = tarayıcı saklamıyor (sessiz geçilmez). */
export function kayitText(k: Kayit | null): string {
  if (k === null) return 'Bu tarayıcı sonuç saklamıyor (özel pencere ya da engellenmiş site verisi).';
  const iyi = k.enIyiKasa === null ? 'henüz kazanılmış oyun yok' : `en iyi kasa ${money(k.enIyiKasa)}`;
  return `Bu tarayıcıda: ${k.oynanan} oyun, ${k.kazanilan} kazanma · ${iyi}.`;
}

export interface RenderOpts {
  mode?: DeckMode;
  /** Başlangıç ekranında gösterilecek uyarı (ör. bozuk tohum). */
  notice?: string;
  /** Yerel kayıt; null = saklanamıyor; undefined = gösterilmez. */
  kayit?: Kayit | null;
}

export function render(root: HTMLElement, s: GameState, cards: readonly Card[], dispatch: (c: Command) => void, opts: RenderOpts = {}): void {
  const mode = opts.mode ?? 'havuz';
  let main: HTMLElement;
  switch (s.phase) {
    case 'start':
      main = startView(dispatch, opts.notice);
      break;
    case 'choosing':
      main = choosingView(s, cards, dispatch);
      break;
    case 'result':
      main = resultView(s, cards, dispatch);
      break;
    case 'finished':
      main = finishedView(s, dispatch, mode, opts.kayit);
      break;
  }
  const showStats = s.phase !== 'start';
  root.replaceChildren(
    header(s, cards),
    showStats ? statsBar(s) : '',
    h('main', { 'data-phase': s.phase }, main),
    showStats ? logEntries(s) : '',
    h('footer', {}, 'BatışOS · eklenti sistemi yoktur ve olmayacaktır. · ', h('span', { 'data-testid': 'surum' }, versionText(mode) + (mode === 'havuz' && s.phase !== 'start' ? ` · tohum ${s.seed}` : ''))),
  );
  // Yeni görünümde odak başlığa gider: klavye ve ekran okuyucu kullanıcısı nerede olduğunu bilir.
  root.querySelector<HTMLElement>('main h1')?.focus();
}

/** Geçersiz kart verisi: oyun başlatılmaz; oyuncuya kısa metin, geliştiriciye ayrıntı. */
export function renderContentError(root: HTMLElement, errors: readonly string[]): void {
  root.replaceChildren(
    h(
      'section',
      { class: 'panel error', role: 'alert' },
      h('h1', {}, 'Şirket henüz kurulamadı. Bu kez sorun gerçekten bizde.'),
      h('details', {}, h('summary', {}, `Geliştirici için: ${errors.length} içerik hatası`), h('ul', {}, ...errors.map((e) => h('li', {}, e)))),
    ),
  );
}
