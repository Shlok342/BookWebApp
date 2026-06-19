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

  if (!store.books || store.books.length === 0) {
    container.innerHTML = "<p>No books added to sanctuary yet, please add one</p>";
    return;
  }

  if (!filteredBooks || filteredBooks.length === 0) {
    container.innerHTML = "<p>No books found matching this filter!</p>";
    return;
  }

  updateLibraryStats(filteredBooks);

  filteredBooks.forEach(book => {
    const card = createBookCard(book);
    container.appendChild(card);
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
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("statusFilter").addEventListener("change", applyFilters);
  document.getElementById("sortOption").addEventListener("change", applyFilters);
});
document.addEventListener("DOMContentLoaded", () => {
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
