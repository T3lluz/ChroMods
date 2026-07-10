const POPUP_ICONS = {
  "category-search": `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 11a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0Z" fill="currentColor" opacity=".16"/><path d="m16.4 16.4 4.1 4.1M6.2 11a4.8 4.8 0 1 1 9.6 0 4.8 4.8 0 0 1-9.6 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  "category-feed": `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="3" width="19" height="18" rx="4" fill="currentColor" opacity=".14"/><path d="M7 8h4v4H7V8Zm6 0h4m-4 3h4M7 15h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "category-nav": `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6.5A3.5 3.5 0 0 1 6.5 3H10v18H6.5A3.5 3.5 0 0 1 3 17.5v-11Z" fill="currentColor" opacity=".18"/><path d="M10 3v18M6.5 8h.01M6.5 12h.01M6.5 16h.01M14 8h7M14 12h5M14 16h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  "category-player": `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="4" width="19" height="16" rx="4" fill="currentColor" opacity=".15"/><path d="m10 8.5 6 3.5-6 3.5v-7Z" fill="currentColor"/><path d="M7 20v1M17 20v1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  "category-live": `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-5 3v-3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" fill="currentColor" opacity=".15"/><path d="M8.2 9.2a4 4 0 0 0 0 5.6m7.6-5.6a4 4 0 0 1 0 5.6M12 12h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
};

function iconMarkup(name) {
  return POPUP_ICONS[name] ?? "";
}
