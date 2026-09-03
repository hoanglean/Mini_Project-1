import type { DBSchema } from 'idb';

// ============================================
// Inspection Record — Core data model
// ============================================

export type InspectionCategory =
  | 'hardware'
  | 'projector'
  | 'ac'
  | 'electrical'
  | 'furniture';

export type SyncStatus =
  | 'DRAFT'
  | 'PENDING_SYNC'
  | 'SYNCED'
  | 'SYNC_ERROR';

export interface InspectionRecord {
  id: string;                // UUID v4
  building: string;          // Tòa nhà (A, B, C, D, E, F)
  floor: string;             // Tầng (Hầm, 1-10)
  roomNumber: string;        // Số phòng
  category: InspectionCategory;
  rating: number;            // 1–5 sao
  notes: string;             // Ghi chú lỗi
  photos: string[];          // Base64 DataURL strings
  inspectorName: string;
  createdAt: number;         // Date.now() timestamp
  updatedAt: number;
  syncStatus: SyncStatus;
  syncAttempts: number;
  lastSyncError?: string;
}

// ============================================
// Form draft — persisted between steps
// ============================================

export interface FormDraft {
  id: string;                // 'current-draft' or specific UUID
  currentStep: number;
  data: Partial<InspectionRecord>;
  updatedAt: number;
}

// ============================================
// IndexedDB Schema
// ============================================

export interface InspectionDB extends DBSchema {
  inspections: {
    key: string;
    value: InspectionRecord;
    indexes: {
      'by-sync-status': SyncStatus;
      'by-created': number;
      'by-building': string;
    };
  };
  drafts: {
    key: string;
    value: FormDraft;
  };
}

// ============================================
// Constants
// ============================================

export const BUILDING_ZONES = [
  {
    zone: 'V',
    buildings: [
      { id: 'VA', name: 'A' },
      { id: 'VB', name: 'B' },
      { id: 'VC', name: 'C' },
      { id: 'VD', name: 'D' },
    ]
  },
  {
    zone: 'K',
    buildings: [
      { id: 'KA', name: 'A' },
      { id: 'KB', name: 'B' },
      { id: 'KC', name: 'C' },
      { id: 'KD', name: 'D' },
    ]
  }
];

// For backward compatibility
export const BUILDINGS = BUILDING_ZONES.flatMap(z => z.buildings);

export const FLOORS = [
  'Hầm', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
];

export const CATEGORIES: { id: InspectionCategory; label: string; icon: string }[] = [
  { id: 'hardware', label: 'Phần cứng', icon: '🖥️' },
  { id: 'projector', label: 'Máy chiếu', icon: '📽️' },
  { id: 'ac', label: 'Điều hòa', icon: '❄️' },
  { id: 'electrical', label: 'Điện', icon: '⚡' },
  { id: 'furniture', label: 'Nội thất', icon: '🪑' },
];

export const CATEGORY_MAP: Record<InspectionCategory, { label: string; icon: string }> = {
  hardware: { label: 'Phần cứng', icon: '🖥️' },
  projector: { label: 'Máy chiếu', icon: '📽️' },
  ac: { label: 'Điều hòa', icon: '❄️' },
  electrical: { label: 'Điện', icon: '⚡' },
  furniture: { label: 'Nội thất', icon: '🪑' },
};

export const DB_NAME = 'vku-inspector-db';
export const DB_VERSION = 1;
