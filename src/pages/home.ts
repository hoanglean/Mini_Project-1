// ============================================
// Home Page — Dashboard
// ============================================

import { getStats } from '../db/database';
import { syncQueue } from '../services/sync-queue';
import { networkMonitor } from '../services/network-monitor';
import { showToast } from '../components/toast';

export async function renderHome(): Promise<string> {
  const stats = await getStats();
  const online = networkMonitor.isOnline;

  return `
    <div class="page page-enter">
      <div class="container">
        <div class="page-header" style="margin-bottom: var(--space-xl);">
          <h1 class="page-title">Xin chào! 👋</h1>
          <p class="page-subtitle">Hệ thống kiểm tra cơ sở vật chất VKU</p>
        </div>

        <!-- Network Status Banner -->
        <div class="glass-card animate-fade-in-up" style="margin-bottom: var(--space-lg); padding: var(--space-md) var(--space-lg); display: flex; align-items: center; gap: var(--space-md); border-left: 3px solid ${online ? 'var(--success)' : 'var(--error)'};">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${online ? 'var(--success)' : 'var(--error)'}; box-shadow: 0 0 10px ${online ? 'var(--success)' : 'var(--error)'}; flex-shrink: 0;"></div>
          <div>
            <div style="font-weight: 600; font-size: var(--font-size-sm);">${online ? 'Đang kết nối mạng' : 'Chế độ ngoại tuyến'}</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${online ? 'Dữ liệu sẽ được đồng bộ tự động' : 'Dữ liệu được lưu cục bộ, sẽ đồng bộ khi có mạng'}</div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid stagger-children" style="margin-bottom: var(--space-xl);">
          <div class="glass-card stat-card accent animate-fade-in-up">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Tổng kiểm tra</div>
          </div>
          <div class="glass-card stat-card info animate-fade-in-up">
            <div class="stat-value">${stats.drafts}</div>
            <div class="stat-label">Bản nháp</div>
          </div>
          <div class="glass-card stat-card warning animate-fade-in-up">
            <div class="stat-value">${stats.pendingSync}</div>
            <div class="stat-label">Chờ đồng bộ</div>
          </div>
          <div class="glass-card stat-card success animate-fade-in-up">
            <div class="stat-value">${stats.synced}</div>
            <div class="stat-label">Đã đồng bộ</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="animate-fade-in-up" style="animation-delay: 200ms; animation-fill-mode: both;">
          <a href="#/inspect" class="btn btn-primary btn-block btn-lg" id="btn-new-inspection" style="margin-bottom: var(--space-md); text-decoration: none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Kiểm tra mới
          </a>

          <div style="display: flex; gap: var(--space-md);">
            <a href="#/history" class="btn btn-secondary" style="flex: 1; text-decoration: none;" id="btn-history">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Lịch sử
            </a>
            <button class="btn btn-secondary" style="flex: 1;" id="btn-sync-now" ${!online || stats.pendingSync === 0 ? 'disabled style="flex:1;opacity:0.5;cursor:not-allowed;"' : ''}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Đồng bộ ngay
            </button>
          </div>
        </div>

        ${stats.syncErrors > 0 ? `
          <div class="glass-card animate-fade-in-up" style="margin-top: var(--space-lg); border-left: 3px solid var(--error); padding: var(--space-md) var(--space-lg);">
            <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span style="font-weight: 600; font-size: var(--font-size-sm); color: var(--error);">${stats.syncErrors} lỗi đồng bộ</span>
            </div>
            <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Các phiếu lỗi sẽ tự động thử lại khi có kết nối mạng ổn định.</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function setupHomeListeners(): void {
  const syncBtn = document.getElementById('btn-sync-now');
  if (syncBtn && !syncBtn.hasAttribute('disabled')) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.setAttribute('disabled', 'true');
      syncBtn.style.opacity = '0.5';
      showToast('Đang đồng bộ hóa...', 'info');
      await syncQueue.processQueue();
      // Refresh the page after sync
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
  }
}
