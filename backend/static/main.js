const container = document.querySelector(".books-container");
import { API } from "./api_service/api.js";
import { showDeleteConfirm } from "./frontend_helpers/show_delete_popup.js";
import { TOAST } from './shows_message/toast.js';
import { applyFilters } from "./filters.js";
import { store } from "./store.js";
import { closeModal } from "./close.js";
import { initThemeToggle, applyThemeFromCover, clearTheme, getProgressColor } from "./theme.js";
import { scheduleMidnightCheck, getGlobalStreak } from "./streak_helper/streak_helper.js";
import {
  openQuotesModal,
  initQuotesModal
} from "./modal_helper/quotesModal.js";
import {
  initNotesModal,
  openNotesModal
} from "./modal_helper/notesModal.js";
import {
  initQuoteOfDayModal
} from "./shows_message/quoteOfTheDayModal.js";
import { renderTagOptions } from "./modal_helper/tagsModal.js";
import { getStats } from "./modal_helper/statsModal.js";
import { getChallenges } from "./modal_helper/challengeModal.js";
import {
  showProgressInput
} from "./streak_helper/progressPopup.js";
import { getBooks } from "./modal_helper/getBooks.js";
import { saveBookHandler } from "./integration_handlers/saveBook.js";
// Example usage inside main
// #region agent log
fetch("http://127.0.0.1:7490/ingest/dc227871-b4dc-4521-8755-f48980c0dcae", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f3a808" },
  body: JSON.stringify({
    sessionId: "f3a808",
    location: "script.js:afterImport",
    message: "module evaluated after api import",
    data: { hasAPI: typeof API !== "undefined" },
    hypothesisId: "H_import",
    timestamp: Date.now(),
  }),
}).catch(() => { });
// #endregion
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

  const bloomedCount = filteredBooks.filter(
    b => b.total_pages > 0 && b.current_page >= b.total_pages
  ).length;
  document.getElementById("bloomedCount").textContent = bloomedCount;

  const storiesEl = document.getElementById("storiesCount");
  if (storiesEl) {
    storiesEl.innerHTML = `<em>${filteredBooks.length} ${filteredBooks.length === 1 ? "story" : "stories"} collected</em>`;
  }

  filteredBooks.forEach(book => {
    const currentPage = Number(book.current_page) || 0;
    const totalPages = Number(book.total_pages) || 0;
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
    const quoteCount = (book.quotes || []).length;
    const pct = isNaN(progress) ? 0 : Math.round(progress);

    const card = document.createElement("div");
    card.classList.add("book-card");

    // 🖼️ BOOK COVER
    if (book.cover_url) {
      const coverDiv = document.createElement("div");
      coverDiv.classList.add("book-cover");
      coverDiv.style.backgroundImage = `url(${book.cover_url})`;
      card.appendChild(coverDiv);
    }

    const titleRow = document.createElement("div");
    titleRow.classList.add("title-row");

    const title = document.createElement("h2");
    title.textContent = book.title;

    // tags container
    const tagsDiv = document.createElement("div");
    tagsDiv.classList.add("tags");

    // render tags
    (book.tags || []).forEach(tag => {
      const tagEl = document.createElement("span");
      tagEl.classList.add("tag");
      tagEl.textContent = tag;
      tagsDiv.appendChild(tagEl);
    });

    titleRow.appendChild(title);
    titleRow.appendChild(tagsDiv);

    const author = document.createElement("p");
    author.classList.add("book-author");
    author.textContent = book.author ? `by ${book.author}` : "";

    const streakBadge = document.createElement("div");
    streakBadge.classList.add("streak-badge");
    const streakCount = book.streak_count ?? 0;
    if (streakCount > 0) {
      streakBadge.textContent = `🔥 ${streakCount}-days for this Book!`;
    } else {
      streakBadge.textContent = "Start your streak today";
      streakBadge.classList.add("streak-badge--cold");
    }

    const progressLabel = document.createElement("p");
    progressLabel.classList.add("reading-progress-label");
    progressLabel.textContent = "READING PROGRESS";

    const pagesRow = document.createElement("div");
    pagesRow.classList.add("pages-row");
    pagesRow.innerHTML = `
      <span>
        <span class="current-page">${currentPage}</span>
        <span class="total-pages"> / ${totalPages} pages</span>
      </span>
      <span class="pct-badge">${pct}%</span>
    `;

    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");

    const progressFill = document.createElement("div");
    progressFill.classList.add("progress");
    progressFill.style.width = "0%";
    progressFill.style.backgroundColor = getProgressColor(0);
    progressBar.appendChild(progressFill);

    progressFill.offsetWidth; // force reflow
    requestAnimationFrame(() => {
      progressFill.style.width = `${progress}%`;
      progressFill.style.backgroundColor = getProgressColor(pct);
    });

    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("card-buttons");

    // ── Open ──
    const openBtn = document.createElement("button");
    openBtn.classList.add("open-btn");
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => openBookModal(book));

    const tagBtn = document.createElement("button");
    tagBtn.classList.add("tag-btn");
    tagBtn.textContent = "Tags";

    tagBtn.addEventListener("click", () => {
      store.activeBookId = book.id;
      store.selectedTags = [...(book.tags || [])];

      renderTagOptions();
      tagsModal.style.display = "block";
    });
    // ── Quotes ──
    const quotesBtn = document.createElement("button");
    quotesBtn.classList.add("quotes-btn");
    quotesBtn.textContent = "Quotes";
    quotesBtn.addEventListener("click", () => openQuotesModal(book));

    // ── Update Progress ──
    const updateBtn = document.createElement("button");
    updateBtn.classList.add("update-btn");
    updateBtn.innerHTML = '<span class="btn-label">Update Progress</span>';

    updateBtn.addEventListener("click", () => {
      showProgressInput(book, currentPage, totalPages);
    });

    // ── Notes ──
    const notesBtn = document.createElement("button");
    notesBtn.classList.add("notes-btn");
    notesBtn.textContent = "Notes";
    notesBtn.addEventListener("click", () => openNotesModal(book));

    // ── Delete ──
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", async () => {
      const confirmDelete = await showDeleteConfirm(book.title);

      if (!confirmDelete) return; // 🚫 user canceled

      try {
        await API.deleteBook(book.id);

        await getBooks();
        await getStats();

      } catch (err) {
        console.error("Delete failed:", err);
        TOAST.showToast("🍂 Could not delete the book.");
      }
    });

    buttonsDiv.append(openBtn,tagBtn, quotesBtn, updateBtn, notesBtn, deleteBtn);

    const quoteHint = document.createElement("p");
    quoteHint.classList.add("quote-count-hint");
    quoteHint.textContent = `${quoteCount} / 5 quotes saved`;

    card.append(titleRow, author, streakBadge, progressLabel, pagesRow, progressBar, buttonsDiv, quoteHint);
    container.appendChild(card);
  }); // ✅ forEach closes here
}
// ─── QUOTES MODAL ─────────────────────────────────────────────────────────────
initQuotesModal();
// ─── NOTES MODAL ──────────────────────────────────────────────────────────────
initNotesModal();
// ─── OPEN BOOK MODAL ──────────────────────────────────────────────────────────
const openBookModalEl = document.getElementById("openBookModal");

async function openBookModal(book) {
  document.getElementById("openBookTitle").textContent = book.title;
  document.getElementById("openBookAuthor").textContent = book.author ? `by ${book.author}` : "";
  openBookModalEl.style.display = "block";
  await applyThemeFromCover(book);
  const current = book.current_page ?? 0;
  const total = book.total_pages ?? 0;
  document.getElementById("openBookProgress").textContent = `${current} / ${total} pages`;

  const quotesDiv = document.getElementById("openBookQuotes");
  quotesDiv.innerHTML = !book.quotes || book.quotes.length === 0
    ? "<p>No quotes yet.</p>"
    : book.quotes.map(q => `<p>"${q}"</p>`).join("");

  const notes = book.notes?.trim();
  document.getElementById("openBookNotes").textContent = notes || "No notes yet.";


}

document.getElementById("openBookClose").addEventListener("click", () => {
  clearTheme();
  openBookModalEl.style.display = "none";
});

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
  if (event.target === openBookModalEl) {
    openBookModalEl.style.display = "none";
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
