const container = document.querySelector(".books-container");
import { applyFilters } from "./filters.js";
import { store } from "./store.js";
import {clearTheme } from "./theme.js";
import { renderTagOptions } from "./modal_helper/tagsModal.js";
import { saveBookHandler } from "./integration_handler/saveBook.js";
import { updateLibraryStats} from "./render_helpers/updateLibraryStats.js";
import { createBookCard } from "./render_helpers/createBookCard.js";
import { addBookModal } from "./circular_import_helper.js";
import { initMain } from "./integration_handler/init.js";
import { openActivityModal } from "./heatmap/heatmapModal.js";
import { initAuth } from "./auth/auth_ui.js";
import { Auth } from "./auth/auth.js";

store.books = [];
store.activeBookId = null;
store.lastKnownGlobalStreak = 0;

// ─── FETCH ALL BOOKS ──────────────────────────────────────────────────────────
function showGuestState() {
  const guestState = document.getElementById("guestState");

  if (guestState) {
      guestState.style.display = "block";
  }

  const bookshelf = document.getElementById("bookshelf");
  if (bookshelf) {
      bookshelf.innerHTML = "";
  }
}

renderTagOptions();
export function renderBooks(filteredBooks = store.books) {
  container.innerHTML = "";

  if (!filteredBooks || filteredBooks.length === 0) {
    container.innerHTML = "<p>No books found matching this filter!</p>";
    return;
  }

  updateLibraryStats(filteredBooks);

  filteredBooks.forEach(book => {
    const card = createBookCard(book);
    container.appendChild(card);
    console.log(store.books[0]); 
  });
}
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
  const guestLoginBtn = document.getElementById("guestLoginBtn");

  if (guestLoginBtn) {
      guestLoginBtn.addEventListener("click", () => {
          document.getElementById("authModal").style.display = "flex";
      });
}
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
document.addEventListener("DOMContentLoaded", () => {

  // #region agent log
  fetch("http://127.0.0.1:7490/ingest/dc227871-b4dc-4521-8755-f48980c0dcae", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "f3a808"
    },
    body: JSON.stringify({
      sessionId: "f3a808",
      location: "script.js:DOMContentLoaded:init",
      message: "main init DOMContentLoaded fired",
      data: {},
      hypothesisId: "H_init",
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  initAuth();
  document.getElementById("logoutBtn")
  .addEventListener("click", () => Auth.logout());
  initMain();
  document
    .getElementById("activityBtn")
    .addEventListener("click", openActivityModal);

  document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);

  document
    .getElementById("statusFilter")
    .addEventListener("change", applyFilters);

  document
    .getElementById("sortOption")
    .addEventListener("change", applyFilters);
  
  document
    .getElementById("genreFilter")
    .addEventListener("change", applyFilters);

});
