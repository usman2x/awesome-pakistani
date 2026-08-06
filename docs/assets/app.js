'use strict';

const searchInput = document.querySelector('#directory-search');
const categorySelect = document.querySelector('#directory-category');
const profiles = [...document.querySelectorAll('[data-profile]')];
const groups = [...document.querySelectorAll('[data-directory-group]')];
const summary = document.querySelector('#results-summary');
const emptyState = document.querySelector('#empty-state');

function updateDirectory() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  let visibleCount = 0;

  for (const profile of profiles) {
    const matchesQuery = !query || profile.dataset.search.includes(query);
    const matchesCategory = category === 'all' || profile.dataset.category === category;
    const visible = matchesQuery && matchesCategory;
    profile.hidden = !visible;
    visibleCount += visible ? 1 : 0;
  }

  for (const group of groups) {
    group.hidden = !group.querySelector('[data-profile]:not([hidden])');
  }

  summary.textContent = visibleCount === profiles.length
    ? `Showing all ${profiles.length} profiles.`
    : `Showing ${visibleCount} of ${profiles.length} profiles.`;
  emptyState.hidden = visibleCount !== 0;
}

searchInput.addEventListener('input', updateDirectory);
categorySelect.addEventListener('change', updateDirectory);
