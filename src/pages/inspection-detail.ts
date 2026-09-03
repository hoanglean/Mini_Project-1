// ============================================
// Inspection Detail Page
// ============================================

import { getInspection, updateSyncStatus, deleteInspection } from '../db/database';
import { renderSyncBadge } from '../components/sync-status';
import { CATEGORY_MAP } from '../db/schema';
import { formatDateTime } from '../utils/date';
import { syncQueue } from '../services/sync-queue';
import { showToast } from '../components/toast';
import { networkMonitor } from '../services/network-monitor';

export async function renderDetail(id: string): Promise<string> {
  const record = await getInspection(id);
  
  if (!record) {
    return `
      <div class="page page-enter">
        <div class="container">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3 class="empty-state-title">Không tìm thấy</h3>
            <p class="empty-state-text">Phiếu kiểm tra không tồn tại hoặc đã bị xóa.</p>
            <a href="#/history" class="btn btn-primary" style="text-decoration: none;">Quay lại</a>
          </div>
        </div>
      </div>
    `;
  }

  const cat = CATEGORY_MAP[record.category];
  const stars = '★'.repeat(record.rating) + '☆'.repeat(5 - record.rating);

  return `
    <div class="page page-enter">
      <div class="container">
        <!-- Back button -->
        <a href="#/history" style="display: inline-flex; align-items: center; gap: var(--space-sm); color: var(--text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-lg); text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Quay lại lịch sử
        </a>

        <div class="page-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md);">
          <div>
            <h1 class="page-title">Tòa ${record.building} - P.${record.roomNumber}</h1>
            <p class="page-subtitle">Tầng ${record.floor} • ${formatDateTime(record.createdAt)}</p>
          </div>
          <div style="flex-shrink: 0;">
            ${renderSyncBadge(record.syncStatus)}
          </div>
        </div>

        <!-- Info Card -->
        <div class="glass-card animate-fade-in-up" style="margin-bottom: var(--space-lg);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
            <div class="detail-section">
              <div class="detail-label">Hạng mục</div>
              <div class="detail-value">${cat?.icon || ''} ${cat?.label || record.category}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Đánh giá</div>
              <div class="detail-value" style="color: #fbbf24; font-size: var(--font-size-lg);">${stars}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Thanh tra</div>
              <div class="detail-value">${record.inspectorName || 'N/A'}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Mã phiếu</div>
              <div class="detail-value" style="font-size: var(--font-size-xs); font-family: monospace; word-break: break-all;">${record.id}</div>
            </div>
          </div>

          ${record.notes ? `
            <div class="detail-section" style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--border);">
              <div class="detail-label">Ghi chú</div>
              <div class="detail-value" style="white-space: pre-wrap;">${record.notes}</div>
            </div>
          ` : ''}
        </div>

        <!-- Photos -->
        ${record.photos && record.photos.length > 0 ? `
          <div class="glass-card animate-fade-in-up" style="margin-bottom: var(--space-lg);">
            <div class="detail-label" style="margin-bottom: var(--space-md);">Ảnh chụp (${record.photos.length})</div>
            <div class="photo-grid">
              ${record.photos.map((p, i) => `
                <div class="photo-item">
                  <img src="${p}" alt="Ảnh ${i + 1}" />
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Sync Info -->
        ${record.syncStatus === 'SYNC_ERROR' ? `
          <div class="glass-card animate-fade-in-up" style="border-left: 3px solid var(--error); margin-bottom: var(--space-lg);">
            <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span style="font-weight: 600; font-size: var(--font-size-sm); color: var(--error);">Lỗi đồng bộ</span>
            </div>
            <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-sm);">
              Số lần thử: ${record.syncAttempts}/3
            </p>
            <p style="font-size: var(--font-size-xs); color: var(--text-muted);">
              ${record.lastSyncError || 'Unknown error'}
            </p>
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-xl);">
          ${record.syncStatus === 'SYNC_ERROR' || record.syncStatus === 'PENDING_SYNC' ? `
            <button class="btn btn-primary" id="btn-retry-sync" style="flex: 1;" ${!networkMonitor.isOnline ? 'disabled style="flex:1;opacity:0.5;"' : ''}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Đồng bộ lại
            </button>
          ` : ''}
          <button class="btn btn-danger" id="btn-delete-inspection" style="flex: 1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Xóa
          </button>
        </div>
      </div>
    </div>
  `;
}

export function setupDetailListeners(id: string): void {
  // Retry sync
  document.getElementById('btn-retry-sync')?.addEventListener('click', async () => {
    await updateSyncStatus(id, 'PENDING_SYNC');
    showToast('Đã thêm vào hàng đợi đồng bộ', 'info');
    syncQueue.processQueue();
    // Refresh
    const html = await renderDetail(id);
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.innerHTML = html;
      setupDetailListeners(id);
    }
  });

  // Delete
  document.getElementById('btn-delete-inspection')?.addEventListener('click', async () => {
    if (confirm('Bạn có chắc muốn xóa phiếu kiểm tra này?')) {
      await deleteInspection(id);
      showToast('Đã xóa phiếu kiểm tra', 'success');
      window.location.hash = '#/history';
    }
  });
}
