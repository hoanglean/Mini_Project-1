import './styles/index.css';
import './styles/components.css';
import './styles/animations.css';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { router } from './router';
import { renderHeader, setupHeaderListeners } from './components/header';
import { renderNav, updateNavBadge } from './components/nav';
import { renderHome, setupHomeListeners } from './pages/home';
import { renderInspectionForm, setupFormListeners, resetFormState } from './pages/inspection-form';
import { renderHistory, setupHistoryListeners } from './pages/history';
import { renderDetail, setupDetailListeners } from './pages/inspection-detail';
import { registerSW } from 'virtual:pwa-register';

// Define Ionic PWA custom elements (Camera web fallback UI)
defineCustomElements(window);

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[PWA] New content available, please refresh.');
    },
    onOfflineReady() {
      console.log('[PWA] App is ready for offline usage!');
    },
  });
}

// App Layout Shell Renderer
function renderShell(contentHtml: string, currentRoute: string): void {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    ${renderHeader()}
    <main id="page-content">
      ${contentHtml}
    </main>
    ${renderNav(currentRoute)}
  `;

  // Attach global listeners
  setupHeaderListeners();
  updateNavBadge();
}

// Register Router Routes
router.on('/', async () => {
  resetFormState();
  const html = await renderHome();
  renderShell(html, '#/');
  setupHomeListeners();
});

router.on('/inspect', async () => {
  const html = await renderInspectionForm();
  renderShell(html, '#/inspect');
  setupFormListeners();
});

router.on('/history', async () => {
  resetFormState();
  const html = await renderHistory();
  renderShell(html, '#/history');
  setupHistoryListeners();
});

router.on('/detail/:id', async (params) => {
  resetFormState();
  const id = params?.id || '';
  const html = await renderDetail(id);
  renderShell(html, '#/history');
  setupDetailListeners(id);
});

// Start Router
document.addEventListener('DOMContentLoaded', () => {
  router.start();
});
