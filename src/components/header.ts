// ============================================
// App Header Component
// ============================================

import { networkMonitor } from '../services/network-monitor';

export function renderHeader(): string {
  const online = networkMonitor.isOnline;
  return `
    <header class="app-header" id="app-header">
      <div class="header-brand">
        <div class="header-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <span class="header-title">VKU Inspector</span>
      </div>
      <div class="header-actions">
        <div class="network-badge ${online ? 'online' : 'offline'}" id="network-badge">
          <span class="network-dot"></span>
          <span id="network-text">${online ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  `;
}

export function setupHeaderListeners(): void {
  networkMonitor.onChange((online) => {
    const badge = document.getElementById('network-badge');
    const text = document.getElementById('network-text');
    if (badge) {
      badge.className = `network-badge ${online ? 'online' : 'offline'}`;
    }
    if (text) {
      text.textContent = online ? 'Online' : 'Offline';
    }
  });
}
