// ============================================
// Offline Sync Queue
// Sequential processing with exponential backoff
// Mock server endpoint simulation
// ============================================

import { getPendingSync, updateSyncStatus, getSyncErrors } from '../db/database';
import type { InspectionRecord } from '../db/schema';
import { networkMonitor } from './network-monitor';
import { showToast } from '../components/toast';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

type SyncCallback = (status: { syncing: boolean; remaining: number; total: number }) => void;

class SyncQueueService {
  private _isSyncing: boolean = false;
  private _listeners: Set<SyncCallback> = new Set();

  constructor() {
    // Auto-sync when network is restored
    networkMonitor.onChange((online) => {
      if (online) {
        console.log('[SyncQueue] Network restored, triggering sync...');
        showToast('Mạng đã kết nối! Đang đồng bộ...', 'info');
        this.processQueue();
      }
    });
  }

  get isSyncing(): boolean {
    return this._isSyncing;
  }

  onStatusChange(callback: SyncCallback): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  private _notify(syncing: boolean, remaining: number, total: number) {
    this._listeners.forEach((cb) => {
      try {
        cb({ syncing, remaining, total });
      } catch (e) {
        console.error('[SyncQueue] Listener error:', e);
      }
    });
  }

  /**
   * Process all pending items in the queue sequentially
   */
  async processQueue(): Promise<void> {
    if (this._isSyncing) {
      console.log('[SyncQueue] Already syncing, skipping...');
      return;
    }

    if (!networkMonitor.isOnline) {
      console.log('[SyncQueue] Offline, queuing for later...');
      return;
    }

    this._isSyncing = true;
    
    try {
      // Get pending items
      const pending = await getPendingSync();
      // Also retry items with sync errors that haven't exceeded max retries
      const errors = await getSyncErrors();
      const retryable = errors.filter(r => r.syncAttempts < MAX_RETRIES);
      
      const allToSync = [...pending, ...retryable];

      if (allToSync.length === 0) {
        console.log('[SyncQueue] Nothing to sync');
        this._isSyncing = false;
        this._notify(false, 0, 0);
        return;
      }

      console.log(`[SyncQueue] Processing ${allToSync.length} items...`);
      this._notify(true, allToSync.length, allToSync.length);

      let synced = 0;
      let failed = 0;

      for (const record of allToSync) {
        if (!networkMonitor.isOnline) {
          console.log('[SyncQueue] Network lost during sync, stopping...');
          showToast('Mất kết nối! Sẽ tiếp tục khi có mạng.', 'warning');
          break;
        }

        try {
          await this._sendToServer(record);
          await updateSyncStatus(record.id, 'SYNCED');
          synced++;
          console.log(`[SyncQueue] ✓ Synced: ${record.id}`);
        } catch (err) {
          failed++;
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          await updateSyncStatus(record.id, 'SYNC_ERROR', errorMsg);
          console.error(`[SyncQueue] ✗ Failed: ${record.id}`, errorMsg);

          // Exponential backoff before next item
          const delay = BASE_DELAY_MS * Math.pow(2, record.syncAttempts);
          await this._sleep(delay);
        }

        this._notify(true, allToSync.length - synced - failed, allToSync.length);
      }

      if (synced > 0) {
        showToast(`Đã đồng bộ ${synced} phiếu kiểm tra thành công!`, 'success');
      }
      if (failed > 0) {
        showToast(`${failed} phiếu lỗi, sẽ thử lại sau.`, 'error');
      }
    } catch (err) {
      console.error('[SyncQueue] Queue processing error:', err);
    } finally {
      this._isSyncing = false;
      this._notify(false, 0, 0);
    }
  }

  /**
   * Mock server endpoint — simulates POST /api/inspections
   * Replace this with actual API call in production
   */
  private async _sendToServer(record: InspectionRecord): Promise<void> {
    console.log(`[SyncQueue] Sending to server: ${record.id}`);
    
    // Simulate network request with random success/failure
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90% success rate for demo
        if (Math.random() < 0.9) {
          console.log(`[SyncQueue] Server response: 200 OK for ${record.id}`);
          resolve();
        } else {
          reject(new Error('Server error: 500 Internal Server Error'));
        }
      }, 500 + Math.random() * 1000); // 500-1500ms latency
    });
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton
export const syncQueue = new SyncQueueService();
