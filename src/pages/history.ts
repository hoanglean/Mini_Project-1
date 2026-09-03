// ============================================
// History Page — List of all inspections
// ============================================

import { getAllInspections } from '../db/database';
import { renderSyncBadge } from '../components/sync-status';
import { CATEGORY_MAP } from '../db/schema';
import type { SyncStatus, InspectionRecord } from '../db/schema';
import { timeAgo } from '../utils/date';

let currentFilter: SyncStatus | 'ALL' = 'ALL';

export async function renderHistory(): Promise<string> {
  const inspections = await getAllInspections();
  const filtered = currentFilter === 'ALL'
    ? inspections
    : inspections.filter(r => r.syncStatus === currentFilter);

  return `
    <div class="page page-enter">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">Lịch sử kiểm tra</h1>
          <p class="page-subtitle">${inspections.length} phiếu kiểm tra</p>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs" id="filter-tabs">
          ${renderFilterTab('ALL', 'Tất cả', inspections.length)}
          ${renderFilterTab('DRAFT', 'Nháp', inspections.filter(r => r.syncStatus === 'DRAFT').length)}
          ${renderFilterTab('PENDING_SYNC', 'Chờ đồng bộ', inspections.filter(r => r.syncStatus === 'PENDING_SYNC').length)}
          ${renderFilterTab('SYNCED', 'Đã đồng bộ', inspections.filter(r => r.syncStatus === 'SYNCED').length)}
          ${renderFilterTab('SYNC_ERROR', 'Lỗi', inspections.filter(r => r.syncStatus === 'SYNC_ERROR').length)}
        </div>

        <!-- Inspection List -->
        <div id="inspection-list" class="stagger-children">
          ${filtered.length === 0 ? renderEmptyState() : filtered.map(renderInspectionItem).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderFilterTab(value: SyncStatus | 'ALL', label: string, count: number): string {
  return `
    <button class="filter-tab ${currentFilter === value ? 'active' : ''}" data-filter="${value}">
      ${label} (${count})
    </button>
  `;
}

function renderInspectionItem(record: InspectionRecord): string {
  const cat = CATEGORY_MAP[record.category];
  const stars = '★'.repeat(record.rating) + '☆'.repeat(5 - record.rating);

  return `
    <a href="#/detail/${record.id}" class="inspection-card animate-fade-in-up" style="text-decoration: none; color: inherit;">
      <div class="inspection-card-icon" style="background: var(--bg-glass);">
        ${cat?.icon || '📋'}
      </div>
      <div class="inspection-card-body">
        <div class="inspection-card-title">Tòa ${record.building} - Phòng ${record.roomNumber}</div>
        <div class="inspection-card-meta">
          <span>${cat?.label || record.category}</span>
          <span>•</span>
          <span>Tầng ${record.floor}</span>
          <span>•</span>
          <span>${timeAgo(record.createdAt)}</span>
        </div>
        <div style="margin-top: 6px;">
          ${renderSyncBadge(record.syncStatus)}
        </div>
      </div>
      <div class="inspection-card-right">
        <div class="inspection-card-stars">${stars}</div>
      </div>
    </a>
  `;
}

function renderEmptyState(): string {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📋</div>
      <h3 class="empty-state-title">Chưa có phiếu kiểm tra</h3>
      <p class="empty-state-text">Bắt đầu kiểm tra cơ sở vật chất ngay!</p>
      <a href="#/inspect" class="btn btn-primary" style="text-decoration: none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Kiểm tra mới
      </a>
    </div>
  `;
}

export function setupHistoryListeners(): void {
  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      currentFilter = (tab as HTMLElement).dataset.filter as SyncStatus | 'ALL';
      
      // Re-render history
      const html = await renderHistory();
      const pageContent = document.getElementById('page-content');
      if (pageContent) {
        pageContent.innerHTML = html;
        setupHistoryListeners();
      }
    });
  });
}
