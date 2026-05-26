const container = document.querySelector(".books-container");
import { applyFilters } from "./filters.js";
import { store } from "./store.js";
import { initThemeToggle, clearTheme } from "./theme.js";
import { scheduleMidnightCheck, getGlobalStreak } from "./streak_helper/streak_helper.js";
import {initQuotesModal} from "./modal_helper/quotesModal.js";
import {initNotesModal} from "./modal_helper/notesModal.js";
import {initQuoteOfDayModal} from "./shows_message/quoteOfTheDayModal.js";
import { renderTagOptions } from "./modal_helper/tagsModal.js";
import { getStats } from "./modal_helper/statsModal.js";
import { getChallenges } from "./modal_helper/challengeModal.js";
import { getBooks } from "./modal_helper/getBooks.js";
import { saveBookHandler } from "./integration_handler/saveBook.js";
import { updateLibraryStats} from "./render_helpers/updateLibraryStats.js";
import { createBookCard } from "./render_helpers/createBookCard.js";
import { addBookModal } from "./circular_import_helper.js";
store.books = [];
store.activeBookId = null;
store.lastKnownGlobalStreak = 0;

// ─── FETCH ALL BOOKS ──────────────────────────────────────────────────────────
initThemeToggle();
initQuoteOfDayModal();

renderTagOptions();
export function renderBooks(filteredBooks = store.books) {
  container.innerHTML = "";

  if (!filteredBooks || filteredBooks.length === 0) {
    container.innerHTML = "<p>No books found. Add one!</p>";
    return;
  }

  updateLibraryStats(filteredBooks);

  filteredBooks.forEach(book => {
    const card = createBookCard(book);
    container.appendChild(card);
  });
}
// ─── QUOTES MODAL ─────────────────────────────────────────────────────────────
initQuotesModal();
// ─── NOTES MODAL ──────────────────────────────────────────────────────────────
initNotesModal();

// ─── ADD BOOK MODAL ───────────────────────────────────────────────────────────

document.querySelector(".add-btn").addEventListener("click", () => {
  addBookModal.style.display = "block";
});

document.getElementById("addBookClose").addEventListener("click", () => {
  addBookModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === addBookModal) { addBookModal.style.display = "none"; clearTheme(); }
  if (event.target === quotesModal) {
    quotesModal.style.display = "none";
    store.activeBookId = null;
    document.getElementById("quoteInput").value = "";
    clearTheme();
  }
  if (event.target === notesModal) {
    notesModal.style.display = "none";
    store.activeBookId = null;
    clearTheme();
  }
  
});

// ─── ADD BOOK ─────────────────────────────────────────────────────────────────
document
  .getElementById("saveBook")
  .addEventListener("click", saveBookHandler);
document.addEventListener("DOMContentLoaded", () => {
  // #region agent log
  fetch("http://127.0.0.1:7490/ingest/dc227871-b4dc-4521-8755-f48980c0dcae", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f3a808" },
    body: JSON.stringify({
      sessionId: "f3a808",
      location: "script.js:DOMContentLoaded:filters",
      message: "filters DOMContentLoaded fired",
      data: {},
      hypothesisId: "H_init",
      timestamp: Date.now(),
    }),
  }).catch(() => { });
  // #endregion
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("statusFilter").addEventListener("change", applyFilters);
  document.getElementById("sortOption").addEventListener("change", applyFilters);
});
// ─── INIT ─────────────────────────────────────────────────────────────────────
setInterval(async () => {
  await getGlobalStreak(); // refresh every minute
}, 60000);
document.addEventListener("DOMContentLoaded", () => {
  // #region agent log
  fetch("http://127.0.0.1:7490/ingest/dc227871-b4dc-4521-8755-f48980c0dcae", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f3a808" },
    body: JSON.stringify({
      sessionId: "f3a808",
      location: "script.js:DOMContentLoaded:init",
      message: "main init DOMContentLoaded fired",
      data: {},
      hypothesisId: "H_init",
      timestamp: Date.now(),
    }),
  }).catch(() => { });
  // #endregion
  getBooks();
  getChallenges();
  getStats();
  getGlobalStreak();
  scheduleMidnightCheck();
});
