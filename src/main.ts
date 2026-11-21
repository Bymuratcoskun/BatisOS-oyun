import './ui/styles.css';
import { createController } from './app/controller.ts';
import { CARDS } from './content/cards.ts';
import { validateCards } from './content/validate-cards.ts';
import { render, renderContentError } from './ui/render.ts';

const root = document.querySelector<HTMLElement>('#app');
if (root === null) throw new Error('BatışOS: #app öğesi bulunamadı');

// Kartlar uygulama başında doğrulanır; geçersiz içerikle yeni oyun başlatılmaz.
const errors = validateCards(CARDS);
if (errors.length > 0) {
  console.error('[BatışOS] İçerik doğrulaması başarısız:\n' + errors.join('\n'));
  renderContentError(root, errors);
} else {
  const ctl = createController(CARDS, (s) => render(root, s, CARDS, ctl.dispatch));
  render(root, ctl.getState(), CARDS, ctl.dispatch);

  // Kısayol: 1/2/3 karar seçer. Düğmeler zaten Tab + Enter ile kullanılabilir.
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || !['1', '2', '3'].includes(e.key)) return;
    root.querySelector<HTMLButtonElement>(`.option[aria-keyshortcuts="${e.key}"]:not(:disabled)`)?.click();
  });
}
