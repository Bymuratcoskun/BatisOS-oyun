import './ui/styles.css';
import { createController } from './app/controller.ts';
import { depoAc, isle, oku, yaz, type Kayit } from './app/kayit.ts';
import { parseHash } from './app/url.ts';
import { CARDS } from './content/cards.ts';
import { POOL } from './content/pool.ts';
import { CHAIN_TEMPLATES } from './content/chains.ts';
import { validateCards, validateChainTemplates, validatePool } from './content/validate-cards.ts';
import { AWARD_IDS } from './core/calculate-awards.ts';
import type { GameState } from './core/types.ts';
import { DIL_ANAHTAR, dilSec, type Dil } from './i18n/dil.ts';
import { dogrulaIngilizce } from './i18n/dogrula.ts';
import { KARTLAR_EN, UNVAN_EN, YATIRIMCI_EN, ZINCIR_EN } from './i18n/icerik-en.ts';
import { UI } from './i18n/ui.ts';
import { render, renderContentError } from './ui/render.ts';

const root = document.querySelector<HTMLElement>('#app');
if (root === null) throw new Error('BatışOS: #app öğesi bulunamadı');

// v1.4 dil: adresteki ?lang= → saklanan seçim → tarayıcı dili. Depo açılamazsa yalnız hatırlanmaz.
const dilDeposu = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();
const saklananDil = (() => {
  try {
    return dilDeposu?.getItem(DIL_ANAHTAR) ?? null;
  } catch {
    return null;
  }
})();
let dil: Dil = dilSec(location.search, saklananDil, navigator.languages ?? [navigator.language]);
const dilUygula = (d: Dil) => {
  dil = d;
  document.documentElement.lang = d;
  try {
    dilDeposu?.setItem(DIL_ANAHTAR, d);
  } catch {
    /* saklanamıyor: bu oturumda yine çalışır */
  }
};
dilUygula(dil);

// v1.2 adres: varsayılan havuz destesi; `#klasik` eski 12 kart; `#tohum-N` aynı deste (bozuksa uyarı).
const secim = parseHash(location.hash);

// Kartlar uygulama başında doğrulanır; geçersiz içerikle yeni oyun başlatılmaz. v1.4: İngilizce de.
const errors = [
  ...validateCards(CARDS).map((e) => `klasik deste: ${e}`),
  ...validatePool(POOL).map((e) => `havuz: ${e}`),
  ...validateChainTemplates(CHAIN_TEMPLATES, POOL),
  ...dogrulaIngilizce(POOL, KARTLAR_EN, CHAIN_TEMPLATES, ZINCIR_EN, AWARD_IDS, UNVAN_EN, YATIRIMCI_EN).map((e) => `İngilizce: ${e}`),
];
if (errors.length > 0) {
  console.error('[BatışOS] İçerik doğrulaması başarısız:\n' + errors.join('\n'));
  renderContentError(root, errors, dil);
} else {
  // Yerel kayıt: depo açılamazsa null ("saklamıyor" yazılır), oyun yine oynanır.
  const depo = depoAc();
  let kayit: Kayit | null = depo ? oku(depo) : null;
  let oncekiAsama: GameState['phase'] = 'start';
  let rehberAcik = false;

  const ciz = (s: GameState) => {
    if (s.phase === 'finished' && oncekiAsama !== 'finished' && depo && kayit) {
      const yeni = isle(kayit, s);
      kayit = yaz(depo, yeni) ? yeni : null; // yazılamadıysa "saklamıyor" de, eski sayıyı gösterme
    }
    oncekiAsama = s.phase;
    const notice = secim.gecersiz !== undefined ? UI[dil].tohumGecersiz(secim.gecersiz) : secim.notice;
    render(root, s, ctl.getCards(), ctl.dispatch, {
      mode: ctl.mode,
      notice,
      kayit,
      dil,
      onDil: (d) => {
        dilUygula(d);
        ciz(ctl.getState());
      },
      rehber: rehberAcik,
      onRehber: (acik) => {
        rehberAcik = acik;
        ciz(ctl.getState());
      },
    });
  };
  const ctl = createController(POOL, CARDS, secim.mode, ciz, secim.seed);
  ciz(ctl.getState());

  // Kısayol: 1/2/3 karar seçer. Düğmeler zaten Tab + Enter ile kullanılabilir.
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || !['1', '2', '3'].includes(e.key)) return;
    root.querySelector<HTMLButtonElement>(`.option[aria-keyshortcuts="${e.key}"]:not(:disabled)`)?.click();
  });
}
