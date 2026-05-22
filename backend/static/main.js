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


// ─── Botanical Delete Confirmation Popup ──────────────────────────────────────

export async function getBooks() {
  try {
    store.books = await API.getBooks();
    applyFilters();
  } catch (error) {
    console.error("Failed to fetch books:", error);
    container.innerHTML = "<p>Could not load books. Is the server running?</p>";
  }
}



// ─── FETCH GLOBAL STREAK ──────────────────────────────────────────────────────

function closeAll() {
  clearTheme();
  quotesModal.style.display = "none";
  notesModal.style.display = "none";
  openBookModalEl.style.display = "none";
}

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) closeAll();
});
//-Function Progress Input, placement like this to ensure reachability of data:
function showProgressInput(book, currentPage, totalPages) {
  const popup = document.createElement("div");
  popup.className = "mini-progress-popup";

  popup.innerHTML = `
    <h3>🌿 ${book.title}</h3>
    <p>Current: ${currentPage} / ${totalPages}</p>

    <input
      type="number"
      class="page-input"
      value="${currentPage}"
      min="0"
      max="${totalPages}"
    >

    <div class="popup-actions">
      <button class="save-btn">Save</button>
      <button class="cancel-btn">Cancel</button>
    </div>
  `;

  document.body.appendChild(popup);

  const input = popup.querySelector(".page-input");
  const saveBtn = popup.querySelector(".save-btn");
  const cancelBtn = popup.querySelector(".cancel-btn");

  cancelBtn.onclick = () => popup.remove();

  saveBtn.onclick = async () => {
    const newPage = parseInt(input.value);

    // Validation
    if (isNaN(newPage)) {
      TOAST.showToast("Enter a valid number 📘");
      return;
    }

    if (newPage < 0 || newPage > totalPages) {
      TOAST.showToast(`Enter between 0 and ${totalPages}`);
      return;
    }

    // Loading state
    saveBtn.disabled = true;
    saveBtn.textContent = "Updating...";

    try {
      const json = await API.updateProgress(book.id, newPage);
      const data = json.data; // 👈 KEEP THIS if your backend returns { data: ... }

      if (data && !data.qualified_for_streak && data.global_streak === 0) {
         TOAST.showToast("📖 Read at least 2 pages to count for streak!");
      }

      if (data && data.global_streak > store.lastKnownGlobalStreak) {
         TOAST.showToast(`🔥 ${data.global_streak}-day global streak!`);
      }

      popup.remove();

      await getBooks();
      await getChallenges();
      await getStats();
      await getGlobalStreak();

    } catch (err) {
      console.error("Failed to update progress:", err);
      TOAST.showToast("Could not update progress.");
    }
    finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  };

  input.focus();
}
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
document.getElementById("saveBook").addEventListener("click", async () => {
  const title = document.getElementById("titleInput").value.trim();
  const author = document.getElementById("authorInput").value.trim();
  const cover = document.getElementById("coverInput").value.trim();
  console.log("COVER INPUT:", cover);
  const totalPages = parseInt(document.getElementById("totalPagesInput").value);
  const currentPage = parseInt(document.getElementById("currentPageInput").value) || 0;
  const genre = document.getElementById("genreInput").value;

  if (!title || isNaN(totalPages)) {
    TOAST.showToast("Please enter a valid title and total pages.");
    return;
  }
  if (currentPage < 0 || currentPage > totalPages) {
    TOAST.showToast(`Pages read must be between 0 and ${totalPages}.`);
    return;
  }

  try {
    await API.addBook({
      title,
      author,
      total_pages: totalPages,
      current_page: currentPage,
      genre,
      cover_url: cover
    });
    closeModal(addBookModal)


    await getBooks();
    await getStats();
  } catch (err) {
    console.error("Failed to add book:", err);
  }
});
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
