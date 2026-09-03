// ============================================
// Inspection Form Page — Multi-step (5 steps)
// ============================================

import { generateUUID } from '../utils/uuid';
import { renderStepIndicator } from '../components/step-indicator';
import { renderStarRating, setupStarRating } from '../components/star-rating';
import { showToast } from '../components/toast';
import { takePhoto } from '../services/camera';
import { saveDraft, getCurrentDraft, clearCurrentDraft, saveInspection } from '../db/database';
import { syncQueue } from '../services/sync-queue';
import { networkMonitor } from '../services/network-monitor';
import { BUILDING_ZONES, FLOORS, CATEGORIES } from '../db/schema';
import type { InspectionRecord, InspectionCategory } from '../db/schema';

// ---- State ----
let currentStep = 0;
let formData: Partial<InspectionRecord> = {};
let isLoadedFromDraft = false;

export function resetFormState(): void {
  isLoadedFromDraft = false;
  currentStep = 0;
  formData = {};
}

// ---- Public ----

export async function renderInspectionForm(): Promise<string> {
  // Only restore from IndexedDB draft when first entering the form page
  if (!isLoadedFromDraft) {
    const draft = await getCurrentDraft();
    if (draft && draft.data) {
      currentStep = draft.currentStep ?? 0;
      formData = draft.data;
    } else {
      currentStep = 0;
      formData = {
        id: generateUUID(),
        photos: [],
        rating: 0,
        notes: '',
        inspectorName: '',
        syncAttempts: 0,
      };
    }
    isLoadedFromDraft = true;
  }

  return `
    <div class="page page-enter">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">Phiếu kiểm tra mới</h1>
          <p class="page-subtitle">Điền thông tin theo từng bước</p>
        </div>

        ${renderStepIndicator(currentStep)}

        <div id="form-step-content" class="animate-fade-in-up">
          ${renderStep(currentStep)}
        </div>

        <div style="display: flex; gap: var(--space-md); margin-top: var(--space-xl);" id="form-actions">
          ${renderFormActions(currentStep)}
        </div>

        <button class="btn btn-secondary btn-block" id="btn-save-draft" style="margin-top: var(--space-md); opacity: 0.7; font-size: var(--font-size-xs);">
          Lưu bản nháp
        </button>
      </div>
    </div>
  `;
}

function renderFormActions(step: number): string {
  return `
    ${step > 0 ? `
      <button class="btn btn-secondary" id="btn-prev-step" style="flex: 1;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Quay lại
      </button>
    ` : `
      <a href="#/" class="btn btn-secondary" id="btn-cancel-form" style="flex: 1; text-decoration: none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Hủy
      </a>
    `}
    
    ${step < 4 ? `
      <button class="btn btn-primary" id="btn-next-step" style="flex: 1;">
        Tiếp theo
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    ` : `
      <button class="btn btn-primary" id="btn-submit" style="flex: 1;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Gửi kiểm tra
      </button>
    `}
  `;
}

function renderStep(step: number): string {
  switch (step) {
    case 0: return renderStep1_Building();
    case 1: return renderStep2_Room();
    case 2: return renderStep3_Category();
    case 3: return renderStep4_Rating();
    case 4: return renderStep5_PhotoSubmit();
    default: return '';
  }
}

// ---- Step 1: Building ----
function renderStep1_Building(): string {
  return `
    <div class="animate-slide-right">
      <h2 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--space-lg);">Chọn khu & tòa nhà</h2>
      ${BUILDING_ZONES.map(zone => `
        <div style="margin-bottom: var(--space-lg);">
          <div style="font-size: var(--font-size-sm); color: var(--text-secondary); font-weight: 600; margin-bottom: var(--space-md); text-transform: uppercase; letter-spacing: 0.5px;">${zone.zone}</div>
          <div class="building-grid stagger-children">
            ${zone.buildings.map(b => `
              <div class="building-item ${formData.building === b.id ? 'selected' : ''}" data-building="${b.id}">
                <span class="building-letter">${b.name}</span>
                <span class="building-name">${zone.zone}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ---- Step 2: Floor & Room ----
function renderStep2_Room(): string {
  return `
    <div class="animate-slide-right">
      <h2 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--space-lg);">Chọn tầng & phòng</h2>
      
      <div class="form-group">
        <label class="label">Tầng</label>
        <select id="select-floor">
          <option value="">-- Chọn tầng --</option>
          ${FLOORS.map(f => `
            <option value="${f}" ${formData.floor === f ? 'selected' : ''}>${f === 'Hầm' ? 'Tầng Hầm' : `Tầng ${f}`}</option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="label">Số phòng</label>
        <input type="text" id="input-room" placeholder="Ví dụ: 301, A201..." value="${formData.roomNumber || ''}" />
      </div>

      <div class="form-group">
        <label class="label">Tên thanh tra</label>
        <input type="text" id="input-inspector" placeholder="Nhập tên của bạn" value="${formData.inspectorName || ''}" />
      </div>
    </div>
  `;
}

// ---- Step 3: Category ----
function renderStep3_Category(): string {
  return `
    <div class="animate-slide-right">
      <h2 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--space-lg);">Hạng mục kiểm tra</h2>
      <div class="category-grid stagger-children">
        ${CATEGORIES.map(c => `
          <div class="category-item ${formData.category === c.id ? 'selected' : ''}" data-category="${c.id}">
            <span class="category-icon">${c.icon}</span>
            <span class="category-label">${c.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ---- Step 4: Rating & Notes ----
function renderStep4_Rating(): string {
  return `
    <div class="animate-slide-right">
      <h2 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--space-lg);">Đánh giá tình trạng</h2>
      
      <div class="form-group" id="rating-container">
        <label class="label">Mức đánh giá (1-5 sao)</label>
        <div style="display: flex; justify-content: center; padding: var(--space-md) 0;">
          ${renderStarRating(formData.rating || 0, () => {})}
        </div>
        <p style="text-align: center; font-size: var(--font-size-xs); color: var(--text-muted);" id="rating-text">
          ${getRatingText(formData.rating || 0)}
        </p>
      </div>

      <div class="form-group">
        <label class="label">Ghi chú về lỗi / vấn đề</label>
        <textarea id="input-notes" placeholder="Mô tả chi tiết tình trạng thiết bị, lỗi phát hiện...">${formData.notes || ''}</textarea>
      </div>
    </div>
  `;
}

function getRatingText(rating: number): string {
  const texts = ['Chọn mức đánh giá', 'Rất tệ', 'Tệ', 'Trung bình', 'Tốt', 'Rất tốt'];
  return texts[rating] || texts[0];
}

// ---- Step 5: Photos & Submit ----
function renderStep5_PhotoSubmit(): string {
  const photos = formData.photos || [];
  const categoryInfo = CATEGORIES.find(c => c.id === formData.category);

  return `
    <div class="animate-slide-right">
      <h2 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--space-lg);">Chụp ảnh & Xác nhận</h2>

      <!-- Summary -->
      <div class="glass-card" style="margin-bottom: var(--space-lg);">
        <h3 style="font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--space-md); color: var(--text-secondary);">Tóm tắt phiếu kiểm tra</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
          <div><span style="font-size: var(--font-size-xs); color: var(--text-muted);">Tòa nhà</span><br/><strong>Tòa ${formData.building || '?'}</strong></div>
          <div><span style="font-size: var(--font-size-xs); color: var(--text-muted);">Tầng</span><br/><strong>${formData.floor || '?'}</strong></div>
          <div><span style="font-size: var(--font-size-xs); color: var(--text-muted);">Phòng</span><br/><strong>${formData.roomNumber || '?'}</strong></div>
          <div><span style="font-size: var(--font-size-xs); color: var(--text-muted);">Hạng mục</span><br/><strong>${categoryInfo ? `${categoryInfo.icon} ${categoryInfo.label}` : '?'}</strong></div>
          <div><span style="font-size: var(--font-size-xs); color: var(--text-muted);">Đánh giá</span><br/><strong>${'★'.repeat(formData.rating || 0)}${'☆'.repeat(5 - (formData.rating || 0))}</strong></div>
          <div><span style="font-size: var(--font-size-xs); color: var(--text-muted);">Thanh tra</span><br/><strong>${formData.inspectorName || '?'}</strong></div>
        </div>
        ${formData.notes ? `
          <div style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--border);">
            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Ghi chú</span><br/>
            <p style="font-size: var(--font-size-sm); margin-top: 4px;">${formData.notes}</p>
          </div>
        ` : ''}
      </div>

      <!-- Photos -->
      <div class="form-group">
        <label class="label">Ảnh chụp (${photos.length}/5)</label>
        <div class="photo-grid" id="photo-grid">
          ${photos.map((p, i) => `
            <div class="photo-item">
              <img src="${p}" alt="Ảnh ${i + 1}" />
              <button class="photo-remove" data-photo-index="${i}" title="Xóa ảnh">✕</button>
            </div>
          `).join('')}
          ${photos.length < 5 ? `
            <div class="photo-add" id="btn-add-photo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Chụp ảnh</span>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// ---- Event Handlers ----

export function setupFormListeners(): void {
  document.getElementById('btn-next-step')?.addEventListener('click', handleNextStep);
  document.getElementById('btn-prev-step')?.addEventListener('click', handlePrevStep);
  document.getElementById('btn-submit')?.addEventListener('click', handleSubmit);
  document.getElementById('btn-save-draft')?.addEventListener('click', handleSaveDraft);
  document.getElementById('btn-cancel-form')?.addEventListener('click', () => {
    resetFormState();
  });

  setupStepListeners(currentStep);
}

function setupStepListeners(step: number): void {
  switch (step) {
    case 0: {
      document.querySelectorAll('.building-item').forEach(el => {
        el.addEventListener('click', () => {
          const building = (el as HTMLElement).dataset.building!;
          formData.building = building;
          document.querySelectorAll('.building-item').forEach(b => b.classList.remove('selected'));
          el.classList.add('selected');
          autoSaveDraft();
        });
      });
      break;
    }
    case 1: {
      document.getElementById('select-floor')?.addEventListener('change', (e) => {
        formData.floor = (e.target as HTMLSelectElement).value;
        autoSaveDraft();
      });
      document.getElementById('input-room')?.addEventListener('input', (e) => {
        formData.roomNumber = (e.target as HTMLInputElement).value;
        autoSaveDraft();
      });
      document.getElementById('input-inspector')?.addEventListener('input', (e) => {
        formData.inspectorName = (e.target as HTMLInputElement).value;
        autoSaveDraft();
      });
      break;
    }
    case 2: {
      document.querySelectorAll('.category-item').forEach(el => {
        el.addEventListener('click', () => {
          const category = (el as HTMLElement).dataset.category as InspectionCategory;
          formData.category = category;
          document.querySelectorAll('.category-item').forEach(c => c.classList.remove('selected'));
          el.classList.add('selected');
          autoSaveDraft();
        });
      });
      break;
    }
    case 3: {
      setupStarRating('rating-container', (rating) => {
        formData.rating = rating;
        const ratingText = document.getElementById('rating-text');
        if (ratingText) ratingText.textContent = getRatingText(rating);
        autoSaveDraft();
      });
      document.getElementById('input-notes')?.addEventListener('input', (e) => {
        formData.notes = (e.target as HTMLTextAreaElement).value;
        autoSaveDraft();
      });
      break;
    }
    case 4: {
      document.getElementById('btn-add-photo')?.addEventListener('click', async () => {
        const photo = await takePhoto();
        if (photo) {
          if (!formData.photos) formData.photos = [];
          formData.photos.push(photo);
          autoSaveDraft();
          refreshStepContent();
        }
      });
      document.querySelectorAll('.photo-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt((btn as HTMLElement).dataset.photoIndex || '0', 10);
          formData.photos?.splice(index, 1);
          autoSaveDraft();
          refreshStepContent();
        });
      });
      break;
    }
  }
}

function refreshStepContent(): void {
  // Update step indicator synchronously
  const indicator = document.getElementById('step-indicator');
  if (indicator) {
    const temp = document.createElement('div');
    temp.innerHTML = renderStepIndicator(currentStep);
    indicator.replaceWith(temp.firstElementChild!);
  }

  // Update step content synchronously
  const content = document.getElementById('form-step-content');
  if (content) {
    content.innerHTML = renderStep(currentStep);
  }

  // Update form action buttons synchronously
  const actions = document.getElementById('form-actions');
  if (actions) {
    actions.innerHTML = renderFormActions(currentStep);
  }

  // Re-bind listeners for the updated DOM
  setupFormListeners();
}

function handleNextStep(): void {
  if (!validateStep(currentStep)) return;
  currentStep++;
  autoSaveDraft();
  refreshStepContent();
}

function handlePrevStep(): void {
  if (currentStep > 0) {
    currentStep--;
    autoSaveDraft();
    refreshStepContent();
  }
}

async function handleSubmit(): Promise<void> {
  if (!validateStep(currentStep)) return;

  const now = Date.now();
  const record: InspectionRecord = {
    id: formData.id || generateUUID(),
    building: formData.building || '',
    floor: formData.floor || '',
    roomNumber: formData.roomNumber || '',
    category: formData.category || 'hardware',
    rating: formData.rating || 0,
    notes: formData.notes || '',
    photos: formData.photos || [],
    inspectorName: formData.inspectorName || '',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'PENDING_SYNC',
    syncAttempts: 0,
  };

  try {
    await saveInspection(record);
    await clearCurrentDraft();
    resetFormState();
    showToast('Phiếu kiểm tra đã được lưu!', 'success');

    if (networkMonitor.isOnline) {
      syncQueue.processQueue();
    }

    window.location.hash = '#/';
  } catch (err) {
    console.error('[Form] Submit error:', err);
    showToast('Lỗi khi lưu phiếu kiểm tra!', 'error');
  }
}

async function handleSaveDraft(): Promise<void> {
  const now = Date.now();
  const record: InspectionRecord = {
    id: formData.id || generateUUID(),
    building: formData.building || '',
    floor: formData.floor || '',
    roomNumber: formData.roomNumber || '',
    category: formData.category || 'hardware',
    rating: formData.rating || 0,
    notes: formData.notes || '',
    photos: formData.photos || [],
    inspectorName: formData.inspectorName || '',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'DRAFT',
    syncAttempts: 0,
  };

  try {
    await saveInspection(record);
    await clearCurrentDraft();
    resetFormState();
    showToast('Đã lưu bản nháp!', 'info');
    window.location.hash = '#/';
  } catch (err) {
    console.error('[Form] Draft save error:', err);
    showToast('Lỗi khi lưu bản nháp!', 'error');
  }
}

function validateStep(step: number): boolean {
  switch (step) {
    case 0:
      if (!formData.building) {
        showToast('Vui lòng chọn tòa nhà!', 'warning');
        return false;
      }
      return true;
    case 1:
      if (!formData.floor) {
        showToast('Vui lòng chọn tầng!', 'warning');
        return false;
      }
      if (!formData.roomNumber?.trim()) {
        showToast('Vui lòng nhập số phòng!', 'warning');
        return false;
      }
      return true;
    case 2:
      if (!formData.category) {
        showToast('Vui lòng chọn hạng mục kiểm tra!', 'warning');
        return false;
      }
      return true;
    case 3:
      if (!formData.rating || formData.rating < 1) {
        showToast('Vui lòng đánh giá từ 1-5 sao!', 'warning');
        return false;
      }
      return true;
    case 4:
      return true;
    default:
      return true;
  }
}

function autoSaveDraft(): void {
  try {
    saveDraft({
      currentStep,
      data: formData,
    });
  } catch (e) {
    console.error('[Form] Auto-save draft error:', e);
  }
}
