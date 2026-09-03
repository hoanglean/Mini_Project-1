// ============================================
// Sync Status Component
// ============================================

import type { SyncStatus } from '../db/schema';

const STATUS_CONFIG: Record<SyncStatus, { label: string; class: string; icon: string }> = {
  DRAFT: {
    label: 'Bản nháp',
    class: 'info',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  },
  PENDING_SYNC: {
    label: 'Chờ đồng bộ',
    class: 'warning',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  },
  SYNCED: {
    label: 'Đã đồng bộ',
    class: 'success',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  },
  SYNC_ERROR: {
    label: 'Lỗi đồng bộ',
    class: 'error',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  },
};

export function renderSyncBadge(status: SyncStatus): string {
  const config = STATUS_CONFIG[status];
  return `<span class="badge badge-${config.class}">${config.icon} ${config.label}</span>`;
}
