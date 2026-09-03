// ============================================
// Star Rating Component
// ============================================

export function renderStarRating(currentRating: number, onChange: (rating: number) => void): string {
  const id = 'star-rating-' + Date.now();
  
  // Register callback globally for event delegation
  (window as any).__starRatingCallback = onChange;

  return `
    <div class="star-rating" id="${id}">
      ${[1, 2, 3, 4, 5].map(i => `
        <button type="button" class="star-btn ${i <= currentRating ? 'filled' : 'empty'}" data-rating="${i}" aria-label="${i} sao">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      `).join('')}
    </div>
  `;
}

export function setupStarRating(containerId: string, callback: (rating: number) => void): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const ratingDiv = container.querySelector('.star-rating');
  if (!ratingDiv) return;

  ratingDiv.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.star-btn') as HTMLElement;
    if (!btn) return;

    const rating = parseInt(btn.dataset.rating || '0', 10);
    if (rating < 1 || rating > 5) return;

    // Update visual state
    ratingDiv.querySelectorAll('.star-btn').forEach((star, index) => {
      if (index < rating) {
        star.classList.remove('empty');
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
        star.classList.add('empty');
      }
    });

    callback(rating);
  });
}
