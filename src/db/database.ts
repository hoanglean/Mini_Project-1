import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type {
  InspectionDB,
  InspectionRecord,
  FormDraft,
  SyncStatus,
} from './schema';
import { DB_NAME, DB_VERSION } from './schema';

// ============================================
// Database Service — Singleton
// ============================================

let dbInstance: IDBPDatabase<InspectionDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<InspectionDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<InspectionDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Inspections store
      if (!db.objectStoreNames.contains('inspections')) {
        const store = db.createObjectStore('inspections', { keyPath: 'id' });
        store.createIndex('by-sync-status', 'syncStatus');
        store.createIndex('by-created', 'createdAt');
        store.createIndex('by-building', 'building');
      }

      // Drafts store
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// ============================================
// Inspection CRUD
// ============================================

export async function saveInspection(record: InspectionRecord): Promise<void> {
  const db = await getDB();
  await db.put('inspections', record);
}

export async function getInspection(id: string): Promise<InspectionRecord | undefined> {
  const db = await getDB();
  return db.get('inspections', id);
}

export async function getAllInspections(): Promise<InspectionRecord[]> {
  const db = await getDB();
  const all = await db.getAll('inspections');
  // Sort by createdAt descending (newest first)
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteInspection(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('inspections', id);
}

// ============================================
// Sync-related queries
// ============================================

export async function getByStatus(status: SyncStatus): Promise<InspectionRecord[]> {
  const db = await getDB();
  const results = await db.getAllFromIndex('inspections', 'by-sync-status', status);
  return results.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getPendingSync(): Promise<InspectionRecord[]> {
  return getByStatus('PENDING_SYNC');
}

export async function getDrafts(): Promise<InspectionRecord[]> {
  return getByStatus('DRAFT');
}

export async function getSynced(): Promise<InspectionRecord[]> {
  return getByStatus('SYNCED');
}

export async function getSyncErrors(): Promise<InspectionRecord[]> {
  return getByStatus('SYNC_ERROR');
}

export async function updateSyncStatus(
  id: string,
  status: SyncStatus,
  error?: string
): Promise<void> {
  const db = await getDB();
  const record = await db.get('inspections', id);
  if (!record) return;

  record.syncStatus = status;
  record.updatedAt = Date.now();
  if (status === 'SYNC_ERROR') {
    record.syncAttempts += 1;
    record.lastSyncError = error || 'Unknown error';
  } else if (status === 'SYNCED') {
    record.lastSyncError = undefined;
  }
  await db.put('inspections', record);
}

// ============================================
// Stats
// ============================================

export interface InspectionStats {
  total: number;
  drafts: number;
  pendingSync: number;
  synced: number;
  syncErrors: number;
}

export async function getStats(): Promise<InspectionStats> {
  const db = await getDB();
  const all = await db.getAll('inspections');

  return {
    total: all.length,
    drafts: all.filter(r => r.syncStatus === 'DRAFT').length,
    pendingSync: all.filter(r => r.syncStatus === 'PENDING_SYNC').length,
    synced: all.filter(r => r.syncStatus === 'SYNCED').length,
    syncErrors: all.filter(r => r.syncStatus === 'SYNC_ERROR').length,
  };
}

// ============================================
// Draft management (form persistence)
// ============================================

const CURRENT_DRAFT_KEY = 'current-draft';

export async function saveDraft(draft: Partial<FormDraft>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('drafts', CURRENT_DRAFT_KEY);
  const record: FormDraft = {
    id: CURRENT_DRAFT_KEY,
    currentStep: draft.currentStep ?? existing?.currentStep ?? 0,
    data: { ...existing?.data, ...draft.data },
    updatedAt: Date.now(),
  };
  await db.put('drafts', record);
}

export async function getCurrentDraft(): Promise<FormDraft | undefined> {
  const db = await getDB();
  return db.get('drafts', CURRENT_DRAFT_KEY);
}

export async function clearCurrentDraft(): Promise<void> {
  const db = await getDB();
  await db.delete('drafts', CURRENT_DRAFT_KEY);
}
