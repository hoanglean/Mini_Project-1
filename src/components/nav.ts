// ============================================
// Bottom Navigation Component
// ============================================

import { getStats } from '../db/database';

export function renderNav(activeRoute: string): string {
  const items = [
    {
      route: '#/',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      label: 'Trang chủ',
    },
    {
      route: '#/inspect',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      label: 'Kiểm tra',
    },
    {
      route: '#/history',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      label: 'Lịch sử',
      badgeId: 'nav-pending-badge',
    },
  ];

  return `
    <nav class="bottom-nav" id="bottom-nav">
      ${items.map(item => `
        <a href="${item.route}" class="nav-item ${activeRoute === item.route ? 'active' : ''}" id="nav-${item.route.replace('#/', '') || 'home'}">
          ${item.icon}
          <span>${item.label}</span>
          ${item.badgeId ? `<span class="nav-item-badge" id="${item.badgeId}" style="display:none"></span>` : ''}
        </a>
      `).join('')}
    </nav>
  `;
}

export async function updateNavBadge(): Promise<void> {
  try {
    const stats = await getStats();
    const badge = document.getElementById('nav-pending-badge');
    if (badge) {
      if (stats.pendingSync > 0) {
        badge.textContent = String(stats.pendingSync);
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (e) {
    console.error('[Nav] Badge update error:', e);
  }
}
