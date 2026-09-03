// ============================================
// Step Indicator Component
// ============================================

const STEP_LABELS = ['Tòa nhà', 'Phòng', 'Hạng mục', 'Đánh giá', 'Ảnh & Gửi'];

export function renderStepIndicator(currentStep: number, totalSteps: number = 5): string {
  return `
    <div class="step-indicator" id="step-indicator">
      ${Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const circleClass = isCompleted ? 'completed' : isActive ? 'active' : '';
        const lineClass = i < currentStep ? 'completed' : '';
        
        return `
          <div class="step-item">
            <div class="step-circle ${circleClass}" title="${STEP_LABELS[i]}">
              ${isCompleted 
                ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` 
                : stepNum}
            </div>
            ${i < totalSteps - 1 ? `<div class="step-line ${lineClass}"></div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}
