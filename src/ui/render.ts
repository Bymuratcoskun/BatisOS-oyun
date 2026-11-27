// Arayüz: durumu gösterir, komut iletir. Kasa hesaplamaz, kazanma koşulu belirlemez.
// Bütün metinler textContent ile yazılır — HTML olarak yorumlanmaz (Kullanilacak_Teknolojiler).
// v1.4: her metin seçilen dilden (src/i18n). Türkçe metinler v1.3'tekiyle birebir.
import type { Command, DeckMode } from '../app/controller.ts';
import { CARD_SET_VERSION } from '../content/cards.ts';
import { POOL_VERSION } from '../content/pool.ts';
import type { Kayit } from '../app/kayit.ts';
import { shareLink } from '../app/url.ts';
import { buildReportCard } from '../core/calculate-awards.ts';
import { cardAt } from '../core/chains.ts';
import { ZINCIR_VERSION } from '../content/chains.ts';
import { RULES } from '../core/new-game.ts';
import { optionOrder } from '../core/option-order.ts';
import type { Card, DecisionRecord, GameState, Stats } from '../core/types.ts';
import type { Dil } from '../i18n/dil.ts';
import { rehber } from '../i18n/rehber.ts';
import { KASA_UYARI, para, sayi, UI, type Metin } from '../i18n/ui.ts';
import {
  acilisNotuYerel,
  ipuclariYerel,
  kararYerel,
  kartYerel,
  sonHarcamaYerel,
  sonSozlerYerel,
  unvanYerel,
  yatirimciYerel,
} from '../i18n/yerel.ts';

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

export function money(n: number, dil: Dil = 'tr'): string {
  return para(n, dil);
}
/** Moral, kasa gibi gerçek eksi işaretiyle: −40 / 100 (K13). */
export function moraleText(n: number): string {
  return `${n < 0 ? MINUS : ''}${Math.abs(n)} / ${RULES.moraleMax}`;
}
function signed(n: number, m: Metin, dil: Dil, unit = ''): string {
  if (n === 0) return m.degismedi;
  return `${n > 0 ? '+' : MINUS}${sayi(Math.abs(n), dil)}${unit}`;
}
/** Artış/azalış yalnız renkle değil, ok işareti ve metinle de anlatılır. */
function change(n: number, m: Metin, dil: Dil, unit = ''): HTMLElement {
  const cls = n > 0 ? 'up' : n < 0 ? 'down' : 'same';
  const arrow = n > 0 ? '▲ ' : n < 0 ? '▼ ' : '= ';
  return h('span', { class: `chg ${cls}` }, arrow + signed(n, m, dil, unit));
}
/**
 * v1.2 (YZ2): seçeneğin yazan etkisi ile gerçekleşen değişim farklıysa nedenini söyler
 * ("+15" yazıyordu, moral 100'de kesildi → "▲ +10 (sınır 100)"). Fark yoksa boş.
 */
export function limitNote(intended: number, actual: number, limit: number, dil: Dil = 'tr'): string {
  return intended === actual ? '' : UI[dil].sinir(limit);
}

interface Ctx {
  dil: Dil;
  m: Metin;
}

function effectsLine(e: Stats, c: Ctx): HTMLElement {
  const part = (label: string, n: number, unit: string) =>
    h('span', { class: `fx ${n > 0 ? 'up' : n < 0 ? 'down' : 'same'}` }, `${label} ${n === 0 ? '0' : signed(n, c.m, c.dil, unit)}`);
  return h('span', { class: 'fx-line' }, part(c.m.kasa, e.cash, ' TL'), ' · ', part(c.m.musteri, e.customers, ''), ' · ', part(c.m.moral, e.morale, ''));
}

function header(s: GameState, cards: readonly Card[], c: Ctx, onDil?: (d: Dil) => void): HTMLElement {
  const week = s.phase === 'start' ? '—' : c.m.hafta(s.turnIndex + 1, cards.length);
  const hedef: Dil = c.dil === 'tr' ? 'en' : 'tr';
  return h(
    'header',
    { class: 'topbar' },
    h('span', { class: 'logo' }, 'BATIŞ OS'),
    h(
      'span',
      { class: 'topbar-right' },
      h('span', { 'data-testid': 'hafta' }, week),
      onDil
        ? // Erişilebilir ad görünen yazının kendisi ("English"/"Türkçe", o dilin `lang`ıyla); açıklama ipucunda.
        // aria-label "Türkçeye geç" görünen "Türkçe" ile uyuşmuyordu (axe label-content-name-mismatch, 2026-11-27).
        h('button', { class: 'lang', lang: hedef, title: c.m.dilDugmesiEtiket, 'data-testid': 'dil', onclick: () => onDil(hedef) }, c.m.dilDugmesi)
        : false,
    ),
  );
}

function statsBar(s: GameState, c: Ctx): HTMLElement {
  const stat = (label: string, value: string, id: string, warn = false) =>
    h('div', { class: `stat${warn ? ' warn' : ''}` }, h('span', { class: 'label' }, label), h('span', { class: 'value', 'data-testid': id }, value));
  return h(
    'section',
    { class: 'stats', 'aria-label': c.m.gostergeler },
    stat(c.m.kasa, money(s.cash, c.dil), 'kasa', s.cash < KASA_UYARI),
    stat(c.m.odeyenMusteri, `${s.customers} / ${RULES.customerTarget}`, 'musteri'),
    stat(c.m.kurucuMorali, moraleText(s.morale), 'moral'),
  );
}

function logEntries(s: GameState, c: Ctx): HTMLElement {
  const items: HTMLElement[] = [...s.decisionHistory]
    .reverse()
    .map((d) => h('li', {}, h('span', { class: 'turn' }, c.m.haftaKisa(d.turn)), ' ', kararYerel(d, s, c.dil).log));
  if (s.openingNote !== null) items.push(h('li', { class: 'note' }, h('span', { class: 'turn' }, c.m.haftaKisa(0)), ' ', acilisNotuYerel(s.openingNote, c.dil)));
  return h(
    'section',
    { class: 'log', 'aria-label': c.m.gunlukEtiket },
    h('h2', {}, c.m.gunlukBaslik),
    items.length ? h('ul', { 'data-testid': 'gunluk' }, ...items) : h('p', { class: 'muted' }, c.m.gunlukBos),
  );
}

function startView(dispatch: (c: Command) => void, c: Ctx, notice?: string, onRehber?: () => void): HTMLElement {
  return h(
    'section',
    { class: 'panel start' },
    h('h1', { tabindex: '-1' }, 'BatışOS'),
    notice ? h('p', { class: 'notice', role: 'status', 'data-testid': 'uyari' }, notice) : false,
    h('p', { class: 'tagline' }, c.m.slogan),
    h('p', {}, c.m.giris),
    h('ul', { class: 'rules' }, ...c.m.kurallar.map((k) => h('li', {}, k))),
    h(
      'div',
      { class: 'start-actions' },
      h('button', { class: 'primary', onclick: () => dispatch({ type: 'new-game' }) }, c.m.sirketiKur),
      onRehber ? h('button', { 'data-testid': 'rehber-ac', onclick: onRehber }, c.m.rehberAc) : false,
    ),
    h('p', { class: 'muted small' }, c.m.acilisNotu),
  );
}

function choosingView(s: GameState, cards: readonly Card[], dispatch: (c: Command) => void, c: Ctx): HTMLElement {
  const asil = cardAt(s, cards)!; // v1.3: takip kartı geldiyse o
  const card = kartYerel(asil, s, c.dil);
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
      effectsLine(o.effects, c),
      // v1.3: zinciri açacak seçenekte kesin uyarı; söylediği gerçekleşir (tests/core/zincir.test.ts)
      ...ipuclariYerel(s, asil.options.find((x) => x.id === o.id)!, c.dil).map((t) => h('span', { class: 'chain-hint', 'data-testid': 'zincir-uyari' }, t)),
    ) as HTMLButtonElement;
    buttons.push(b);
  });
  return h(
    'section',
    { class: 'panel card', 'aria-labelledby': 'kart-baslik' },
    h('h1', { id: 'kart-baslik', tabindex: '-1', 'data-testid': 'kart-baslik' }, card.title),
    h('p', { class: 'desc' }, card.description),
    h('div', { class: 'options', role: 'group', 'aria-label': c.m.kararlar }, ...buttons),
  );
}

function resultView(s: GameState, cards: readonly Card[], dispatch: (c: Command) => void, c: Ctx): HTMLElement {
  const d = s.decisionHistory[s.decisionHistory.length - 1]!;
  const yer = kararYerel(d, s, c.dil);
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
    h('h1', { tabindex: '-1' }, c.m.kararBaslik(yer.text)),
    h(
      'table',
      { class: 'deltas', 'data-testid': 'degisimler' },
      h(
        'tbody',
        {},
        row(c.m.kasa, money(d.before.cash, c.dil), money(d.after.cash, c.dil), change(d.delta.cash, c.m, c.dil, ' TL')),
        row(c.m.musteri, String(d.before.customers), String(d.after.customers), notlu(change(d.delta.customers, c.m, c.dil), limitNote(yazan.customers, d.delta.customers, 0, c.dil))),
        row(
          c.m.moral,
          sayi(d.before.morale, c.dil),
          sayi(d.after.morale, c.dil),
          notlu(change(d.delta.morale, c.m, c.dil), limitNote(yazan.morale, d.delta.morale, RULES.moraleMax, c.dil)),
        ),
      ),
    ),
    h('blockquote', { 'data-testid': 'sonuc-metni' }, yer.log),
    ended && h('p', { class: 'alarm' }, s.endReason === 'cash_depleted' ? c.m.kasaBittiAlarm : c.m.sonHaftaAlarm),
    h(
      'button',
      { class: 'primary', onclick: () => dispatch(ended ? { type: 'show-results' } : { type: 'next-turn' }) },
      ended ? c.m.sonuclariGor : c.m.sonrakiHafta, // v1.2: üst çubukla aynı kelime (YZ2)
    ),
  );
}

function endReasonText(s: GameState, m: Metin): string {
  return s.endReason === 'goals_met'
    ? m.nedenKazandi
    : s.endReason === 'cash_depleted'
      ? m.nedenKasa(s.decisionHistory.length)
      : m.nedenMusteri(s.customers, RULES.customerTarget);
}

/**
 * v1.1 paylaşılan sonuç metni. Sonuç ekranıyla aynı işlevlerden üretilir; ayrı hesap yapmaz.
 * Kimlik, hesap, kişisel bilgi içermez. v1.4: seçilen dilde; İngilizce bağlantı `?lang=en` taşır.
 */
export function shareText(s: GameState, mode: DeckMode = 'havuz', dil: Dil = 'tr'): string {
  const r = buildReportCard(s);
  const m = UI[dil];
  return [
    `BatışOS v${__SURUM__} — ${s.outcome === 'won' ? m.ayakta : m.kapandi}`,
    endReasonText(s, m),
    m.paylasOzet(money(s.cash, dil), s.customers, RULES.customerTarget, moraleText(s.morale), r.infrastructureCount), // v1.2: altyapı sayısı (YZ2)
    r.awards.length ? m.paylasUnvanlar(r.awards.map((a) => unvanYerel(a, dil).title).join('; ')) : m.paylasUnvanYok,
    m.paylasBaglanti(shareLink(__OYUN_ADRESI__, mode, s.seed, dil)), // v1.2: bağlantı aynı desteyi açar
  ].join('\n');
}

/** Panoya kopyala; olmazsa sessiz geçme: nedenini söyle, metni seçilebilir göster. */
function copyBlock(text: string, m: Metin): HTMLElement {
  const status = h('p', { class: 'muted', role: 'status', 'data-testid': 'kopya-durum' });
  const wrap = h('div', { class: 'share' });
  const fallback = () => {
    status.textContent = m.kopyalanamadi;
    if (wrap.querySelector('textarea') === null) {
      const ta = h('textarea', { readonly: true, rows: '5', 'aria-label': m.sonucMetni, 'data-testid': 'kopya-metni' }) as HTMLTextAreaElement;
      ta.value = text;
      wrap.append(ta);
      ta.select();
    }
  };
  const copy = () => {
    if (!navigator.clipboard?.writeText) return fallback();
    navigator.clipboard.writeText(text).then(() => {
      status.textContent = m.kopyalandi;
    }, fallback);
  };
  wrap.prepend(h('button', { onclick: copy }, m.kopyalaDugme), status);
  return wrap;
}

function finishedView(s: GameState, dispatch: (c: Command) => void, mode: DeckMode, kayit: Kayit | null | undefined, c: Ctx): HTMLElement {
  const r = buildReportCard(s);
  const won = s.outcome === 'won';
  const m = c.m;
  const dl = (k: string, v: string, id?: string) => [h('dt', {}, k), h('dd', id ? { 'data-testid': id } : {}, v)];
  const son = sonSozlerYerel(s, c.dil);
  return h(
    'section',
    { class: `panel finished ${won ? 'won' : 'lost'}` },
    h('h1', { tabindex: '-1', 'data-testid': 'bitis-baslik' }, won ? m.ayakta : m.kapandi),
    h('p', { class: 'reason', 'data-testid': 'bitis-nedeni' }, endReasonText(s, m)),
    h(
      'dl',
      { class: 'report' },
      ...dl(m.dayanilan, m.haftaSayisi(r.turnsSurvived)), // v1.2: "tur" değil "hafta" (YZ2)
      ...dl(m.kalanKasa, money(s.cash, c.dil), 'son-kasa'),
      ...dl(m.odeyenMusteri, String(s.customers), 'son-musteri'),
      ...dl(m.kurucuMorali, moraleText(s.morale)),
      ...dl(m.altyapiKarari, String(r.infrastructureCount)),
      ...dl(won ? m.sonImza : m.sonHarcama, sonHarcamaYerel(r, s, c.dil) ?? m.harcamaYok), // v1.2: kazanınca "Son imza" (YZ2, operatör onayı)
    ),
    h('p', { class: 'investor' }, h('strong', {}, m.yatirimciYorumu), yatirimciYerel(r, c.dil)),
    h('h2', {}, m.karne),
    r.awards.length
      ? h(
          'ul',
          { class: 'awards', 'data-testid': 'unvanlar' },
          ...r.awards.map((a) => {
            const u = unvanYerel(a, c.dil);
            return h('li', {}, h('strong', {}, u.title), h('span', {}, u.quip));
          }),
        )
      : h('p', { class: 'muted', 'data-testid': 'unvanlar' }, m.unvanYok),
    // v1.3: açılıp takip kartı gelmemiş zincirler
    ...(son.length ? [h('h2', {}, m.geridekalanlar), h('ul', { class: 'epilogues', 'data-testid': 'son-soz' }, ...son.map((x) => h('li', {}, x)))] : []),
    h('h2', { id: 'karar-ozeti' }, m.kararOzeti),
    // v1.1: harcama ve kalan kasa — oyuncu batışını adım adım görsün. Değerler yalnız karar geçmişinden.
    h(
      'table',
      { class: 'summary', 'aria-labelledby': 'karar-ozeti', 'data-testid': 'karar-ozeti' },
      h('thead', {}, h('tr', {}, ...m.ozetBasliklar.map((t) => h('th', { scope: 'col' }, t)))),
      h(
        'tbody',
        {},
        h('tr', {}, h('td', {}, '—'), h('td', {}, m.baslangic), h('td', {}, ''), h('td', { class: 'num' }, money(RULES.startCash, c.dil))),
        ...s.decisionHistory.map((d: DecisionRecord) =>
          h(
            'tr',
            {},
            h('td', {}, String(d.turn)),
            h('td', {}, kararYerel(d, s, c.dil).text),
            h('td', { class: 'num' }, signed(d.delta.cash, m, c.dil, ' TL')),
            h('td', { class: 'num' }, money(d.after.cash, c.dil)),
          ),
        ),
      ),
    ),
    copyBlock(shareText(s, mode, c.dil), m),
    kayit === undefined ? false : h('p', { class: 'muted small', 'data-testid': 'kayit' }, kayitText(kayit, c.dil)),
    h(
      'div',
      { class: 'restart' },
      h('button', { class: 'primary', onclick: () => dispatch({ type: 'restart', blameTech: false }) }, m.yenidenDene),
      h('button', { onclick: () => dispatch({ type: 'restart', blameTech: true }) }, m.sucuAt),
    ),
  );
}

/** v1.4 oyun rehberi: oyunun içinde, seçilen dilde. Aynı metinden REHBER.md ve GUIDE.md üretilir. */
function guideView(c: Ctx, onBack: () => void): HTMLElement {
  const g = rehber(c.dil);
  return h(
    'section',
    { class: 'panel guide', 'aria-labelledby': 'rehber-baslik', 'data-testid': 'rehber' },
    h('h1', { id: 'rehber-baslik', tabindex: '-1' }, g.baslik),
    h('p', { class: 'tagline' }, g.ozet),
    h('nav', { 'aria-label': g.icindekiler }, h('ul', { class: 'toc' }, ...g.bolumler.map((b) => h('li', {}, h('a', { href: `#rehber-${b.id}`, onclick: (e: Event) => {
      e.preventDefault(); // adres çubuğundaki `#tohum-…` bozulmasın
      document.getElementById(`rehber-${b.id}`)?.scrollIntoView();
    } }, b.baslik))))),
    ...g.bolumler.flatMap((b) => [
      h('h2', { id: `rehber-${b.id}` }, b.baslik.toLocaleUpperCase(c.dil === 'tr' ? 'tr-TR' : 'en-US')),
      ...b.bloklar.map((k) => (typeof k === 'string' ? h('p', {}, k) : h('ul', {}, ...k.map((x) => h('li', {}, x))))),
    ]),
    h('button', { class: 'primary', 'data-testid': 'rehber-kapat', onclick: onBack }, c.m.rehberGeri),
  );
}

/** Alt satırdaki sürüm: havuzda havuz sürümü, klasik destede kart seti (hata bildirimi hangi içerik olduğunu taşısın). */
export function versionText(mode: DeckMode): string {
  return mode === 'klasik' ? `v${__SURUM__} · ${CARD_SET_VERSION} · klasik` : `v${__SURUM__} · ${POOL_VERSION} · ${ZINCIR_VERSION}`;
}

/** v1.2: yerel kayıt satırı. null = tarayıcı saklamıyor (sessiz geçilmez). */
export function kayitText(k: Kayit | null, dil: Dil = 'tr'): string {
  const m = UI[dil];
  if (k === null) return m.kayitYok;
  return m.kayitSatir(k.oynanan, k.kazanilan, k.enIyiKasa === null ? null : money(k.enIyiKasa, dil));
}

export interface RenderOpts {
  mode?: DeckMode;
  /** Başlangıç ekranında gösterilecek uyarı (ör. bozuk tohum). */
  notice?: string;
  /** Yerel kayıt; null = saklanamıyor; undefined = gösterilmez. */
  kayit?: Kayit | null;
  /** v1.4: ekran dili (varsayılan Türkçe). */
  dil?: Dil;
  /** v1.4: dil düğmesi; verilmezse düğme çizilmez. */
  onDil?: (d: Dil) => void;
  /** v1.4: rehber açık mı; açıksa oyun yerine rehber çizilir (oyun durumu değişmez). */
  rehber?: boolean;
  onRehber?: (acik: boolean) => void;
}

export function render(root: HTMLElement, s: GameState, cards: readonly Card[], dispatch: (c: Command) => void, opts: RenderOpts = {}): void {
  const mode = opts.mode ?? 'havuz';
  const dil = opts.dil ?? 'tr';
  const c: Ctx = { dil, m: UI[dil] };
  const onRehber = opts.onRehber;
  let main: HTMLElement;
  if (opts.rehber && onRehber) main = guideView(c, () => onRehber(false));
  else
    switch (s.phase) {
      case 'start':
        main = startView(dispatch, c, opts.notice, onRehber && (() => onRehber(true)));
        break;
      case 'choosing':
        main = choosingView(s, cards, dispatch, c);
        break;
      case 'result':
        main = resultView(s, cards, dispatch, c);
        break;
      case 'finished':
        main = finishedView(s, dispatch, mode, opts.kayit, c);
        break;
    }
  const showStats = s.phase !== 'start' && !opts.rehber;
  root.replaceChildren(
    header(s, cards, c, opts.onDil),
    showStats ? statsBar(s, c) : '',
    h('main', { 'data-phase': opts.rehber ? 'rehber' : s.phase }, main),
    showStats ? logEntries(s, c) : '',
    h(
      'footer',
      {},
      c.m.altSatir,
      h('span', { 'data-testid': 'surum' }, versionText(mode) + (mode === 'havuz' && s.phase !== 'start' ? c.m.tohum(s.seed) : '')),
      onRehber && !opts.rehber && s.phase !== 'start' ? h('span', {}, ' · ', h('button', { class: 'link', 'data-testid': 'rehber-alt', onclick: () => onRehber(true) }, c.m.rehberBaslik)) : false,
    ),
  );
  // Yeni görünümde odak başlığa gider: klavye ve ekran okuyucu kullanıcısı nerede olduğunu bilir.
  root.querySelector<HTMLElement>('main h1')?.focus();
}

/** Geçersiz kart verisi: oyun başlatılmaz; oyuncuya kısa metin, geliştiriciye ayrıntı. */
export function renderContentError(root: HTMLElement, errors: readonly string[], dil: Dil = 'tr'): void {
  const m = UI[dil];
  root.replaceChildren(
    h(
      'section',
      { class: 'panel error', role: 'alert' },
      h('h1', {}, m.icerikHatasi),
      h('details', {}, h('summary', {}, m.icerikHatasiAyrinti(errors.length)), h('ul', {}, ...errors.map((e) => h('li', {}, e)))),
    ),
  );
}
