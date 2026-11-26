import './ui/styles.css';
import { createController } from './app/controller.ts';
import { depoAc, isle, oku, yaz, type Kayit } from './app/kayit.ts';
import { parseHash } from './app/url.ts';
import { CARDS } from './content/cards.ts';
import { POOL } from './content/pool.ts';
import { CHAIN_TEMPLATES } from './content/chains.ts';
import { validateCards, validateChainTemplates, validatePool } from './content/validate-cards.ts';
import type { GameState } from './core/types.ts';
import { render, renderContentError } from './ui/render.ts';

const root = document.querySelector<HTMLElement>('#app');
if (root === null) throw new Error('BatışOS: #app öğesi bulunamadı');

// v1.2 adres: varsayılan havuz destesi; `#klasik` eski 12 kart; `#tohum-N` aynı deste (bozuksa uyarı).
const secim = parseHash(location.hash);

// Kartlar uygulama başında doğrulanır; geçersiz içerikle yeni oyun başlatılmaz.
const errors = [...validateCards(CARDS).map((e) => `klasik deste: ${e}`), ...validatePool(POOL).map((e) => `havuz: ${e}`), ...validateChainTemplates(CHAIN_TEMPLATES, POOL)];
if (errors.length > 0) {
  console.error('[BatışOS] İçerik doğrulaması başarısız:\n' + errors.join('\n'));
  renderContentError(root, errors);
} else {
  // Yerel kayıt: depo açılamazsa null ("saklamıyor" yazılır), oyun yine oynanır.
  const depo = depoAc();
  let kayit: Kayit | null = depo ? oku(depo) : null;
  let oncekiAsama: GameState['phase'] = 'start';

  const ciz = (s: GameState) => {
    if (s.phase === 'finished' && oncekiAsama !== 'finished' && depo && kayit) {
      const yeni = isle(kayit, s);
      kayit = yaz(depo, yeni) ? yeni : null; // yazılamadıysa "saklamıyor" de, eski sayıyı gösterme
    }
    oncekiAsama = s.phase;
    render(root, s, ctl.getCards(), ctl.dispatch, { mode: ctl.mode, notice: secim.notice, kayit });
  };
  const ctl = createController(POOL, CARDS, secim.mode, ciz, secim.seed);
  ciz(ctl.getState());

  // Kısayol: 1/2/3 karar seçer. Düğmeler zaten Tab + Enter ile kullanılabilir.
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || !['1', '2', '3'].includes(e.key)) return;
    root.querySelector<HTMLButtonElement>(`.option[aria-keyshortcuts="${e.key}"]:not(:disabled)`)?.click();
  });
}
