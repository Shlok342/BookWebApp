const container = document.querySelector(".books-container");

let books = [];
let activeBookId = null;

// ─── FETCH ALL BOOKS ──────────────────────────────────────────────────────────
async function getBooks() {
  try {
    const response = await fetch("/books");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    books = await response.json();
    applyFilters();
  } catch (error) {
    console.error("Failed to fetch books:", error);
    container.innerHTML = "<p>Could not load books. Is the server running?</p>";
  }
}

// ─── FETCH STATS ──────────────────────────────────────────────────────────────
// FIX: was using `${BASE_URL}/stats` (full origin URL) — everything else uses
//      a relative path, so this was inconsistent and would break behind a proxy.
async function getStats() {
  try {
    const res = await fetch("/stats");
    if (!res.ok) throw new Error("Failed to fetch stats");

    const data = await res.json();

    document.getElementById("totalBooks").textContent    = data.total_books;
    document.getElementById("totalPages").textContent    = data.total_pages_read;
    document.getElementById("monthlyPages").textContent  = data.pages_this_month;
    document.getElementById("avgPages").textContent      = data.avg_pages_per_month;

  } catch (err) {
    console.error("Stats error:", err);
  }
}

// ─── FETCH GLOBAL STREAK ──────────────────────────────────────────────────────
async function getGlobalStreak() {
  try {
    const res = await fetch("/streak");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    renderGlobalStreak(data.streak_count);
  } catch (err) {
    console.error("Failed to fetch global streak:", err);
  }
}

// ─── RENDER GLOBAL STREAK ─────────────────────────────────────────────────────
function renderGlobalStreak(count) {
  const el = document.getElementById("globalStreak");
  if (!el) return;
  if (count > 0) {
    el.textContent = `🔥 ${count} day streak`;
    el.classList.remove("global-streak-badge--cold");
  } else {
    el.textContent = "No streak yet — read something today!";
    el.classList.add("global-streak-badge--cold");
  }
}

// ─── RENDER BOOKS ─────────────────────────────────────────────────────────────
function renderBooks(filteredBooks = books) {
  container.innerHTML = "";

  if (!filteredBooks || filteredBooks.length === 0) {
    container.innerHTML = "<p>No books found. Add one!</p>";
    return;
  }

  // ✅ FIX: use filteredBooks instead of books
  const bloomedCount = filteredBooks.filter(
    b => b.total_pages > 0 && b.current_page >= b.total_pages
  ).length;

  document.getElementById("bloomedCount").textContent = bloomedCount;

  const storiesEl = document.getElementById("storiesCount");
  if (storiesEl) {
    storiesEl.innerHTML = `<em>${filteredBooks.length} ${filteredBooks.length === 1 ? "story" : "stories"} collected</em>`;
  }

  // ✅ MAIN CHANGE HERE
  filteredBooks.forEach(book => {
    const currentPage = Number(book.current_page) || 0;
    const totalPages  = Number(book.total_pages) || 0;

    const progress = totalPages > 0
      ? (currentPage / totalPages) * 100
      : 0;
    const quoteCount  = (book.quotes || []).length;
    const pct = isNaN(progress) ? 0 : Math.round(progress);;

    const card = document.createElement("div");
    card.classList.add("book-card");

    const title = document.createElement("h2");
    title.textContent = book.title;

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
    progressFill.style.width = `${progress}%`;
    progressBar.appendChild(progressFill);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("card-buttons");

    const quotesBtn = document.createElement("button");
    quotesBtn.classList.add("quotes-btn");
    quotesBtn.textContent = "Quotes";
    quotesBtn.addEventListener("click", () => openQuotesModal(book));

    const openBtn = document.createElement("button");
    openBtn.classList.add("open-btn");
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => openBookModal(book));

    const updateBtn = document.createElement("button");
    updateBtn.classList.add("update-btn");
    updateBtn.innerHTML = '<span class="btn-label">Update Progress</span>';
    updateBtn.addEventListener("click", async () => {
      const newPage = parseInt(prompt(
        `How many pages of "${book.title}" have you read?\n(Current: ${currentPage} / ${totalPages})`
      ));
      if (isNaN(newPage)) return;
      if (newPage < 0 || newPage > totalPages) {
        alert(`Please enter a number between 0 and ${totalPages}.`);
        return;
      }
      try {
        const res = await fetch(`/books/${book.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_page: newPage })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        renderGlobalStreak(data.global_streak);
        if (data.global_streak > 1) {
          alert(`🔥 ${data.global_streak}-day global reading streak!`);
        }
        await getBooks();
        await getStats();
      } catch (err) {
        console.error("Failed to update progress:", err);
        alert("Could not update progress. Is the server running?");
      }
    });

    const notesBtn = document.createElement("button");
    notesBtn.classList.add("notes-btn");
    notesBtn.textContent = "Notes";
    notesBtn.addEventListener("click", () => openNotesModal(book));

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
      try {
        const res = await fetch(`/books/${book.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        await getBooks();
        await getStats();
      } catch (err) {
        console.error("Failed to delete book:", err);
        alert("Could not delete book. Is the server running?");
      }
    });

    buttonsDiv.append(openBtn, quotesBtn, updateBtn, notesBtn, deleteBtn);

    const quoteHint = document.createElement("p");
    quoteHint.classList.add("quote-count-hint");
    quoteHint.textContent = `${quoteCount} / 5 quotes saved`;

    card.append(title, author, streakBadge, progressLabel, pagesRow, progressBar, buttonsDiv, quoteHint);
    container.appendChild(card);
  });
}
// Function Aplly filters: 
function applyFilters() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  const filterValue = document.getElementById("statusFilter").value;
  const sortValue   = document.getElementById("sortOption").value;

  let filtered = books.filter(book => {

    const matchesSearch = book.title.toLowerCase().includes(searchValue);

    let status = "not-started";
    if (book.current_page === 0) status = "not-started";
    else if (book.current_page === book.total_pages) status = "completed";
    else status = "in-progress";

    const matchesFilter = filterValue === "all" || status === filterValue;

    return matchesSearch && matchesFilter;
  });

  // 🔥 SORTING LOGIC
  // 🔥 SORTING

// 📊 PROGRESS
if (sortValue === "progress-asc") {
  filtered.sort((a, b) => {
    const progA = (a.current_page || 0) / (a.total_pages || 1);
    const progB = (b.current_page || 0) / (b.total_pages || 1);
    return progA - progB;
  });
}

if (sortValue === "progress-desc") {
  filtered.sort((a, b) => {
    const progA = (a.current_page || 0) / (a.total_pages || 1);
    const progB = (b.current_page || 0) / (b.total_pages || 1);
    return progB - progA;
  });
}

// 🕒 DATE (THIS IS WHAT YOU WANTED)
if (sortValue === "date-desc") {
  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });
}

if (sortValue === "date-asc") {
  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateA - dateB;
  });
}

  renderBooks(filtered);
}
// ─── QUOTES MODAL ─────────────────────────────────────────────────────────────
const quotesModal  = document.getElementById("quotesModal");
const addBookModal = document.getElementById("addBookModal");

function openQuotesModal(book) {
  activeBookId = book.id;
  document.getElementById("quotesModalTitle").textContent = book.title;
  renderQuotesList(book.quotes || []);
  quotesModal.style.display = "block";
}

function renderQuotesList(quotes) {
  document.getElementById("quotesCount").textContent = quotes.length;
  document.getElementById("quotesList").innerHTML = quotes.length === 0
    ? `<p class="no-quotes">No quotes yet. Add one below.</p>`
    : quotes.map(q => `<div class="quote-item">&#8220;${q}&#8221;</div>`).join("");
  document.getElementById("addQuoteArea").style.display = quotes.length >= 5 ? "none" : "block";
}

document.getElementById("quotesClose").addEventListener("click", () => {
  quotesModal.style.display = "none";
  activeBookId = null;
  document.getElementById("quoteInput").value = "";
});

document.getElementById("addQuoteBtn").addEventListener("click", async () => {
  const text   = document.getElementById("quoteInput").value.trim();
  const book   = books.find(b => b.id === activeBookId);
  const quotes = [...(book?.quotes || [])];

  if (!text || !book) return;
  if (quotes.length >= 5) { alert("Maximum 5 quotes per book."); return; }

  quotes.push(text);

  try {
    const res = await fetch(`/books/${activeBookId}/quotes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotes })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (data.streak_count > 1) {
      alert(`🔥 ${data.streak_count}-day reading streak!`);
    }
    document.getElementById("quoteInput").value = "";
    await getBooks();
    const updated = books.find(b => b.id === activeBookId);
    if (updated) renderQuotesList(updated.quotes || []);
  } catch (err) {
    console.error("Failed to save quote:", err);
    alert("Could not save quote. Is the server running?");
  }
});

// ─── NOTES MODAL ──────────────────────────────────────────────────────────────
const notesModal = document.getElementById("notesModal");

function countWords(text) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function openNotesModal(book) {
  activeBookId = book.id;
  document.getElementById("notesModalTitle").textContent = `Notes — ${book.title}`;
  const existing = book.notes || "";
  document.getElementById("notesInput").value = existing;
  document.getElementById("notesWordCount").textContent = countWords(existing);
  notesModal.style.display = "block";
}

document.getElementById("notesInput").addEventListener("input", () => {
  const textarea = document.getElementById("notesInput");
  const words    = textarea.value.trim() === "" ? [] : textarea.value.trim().split(/\s+/);
  if (words.length > 500) textarea.value = words.slice(0, 500).join(" ");
  document.getElementById("notesWordCount").textContent = Math.min(words.length, 500);
});

document.getElementById("notesClose").addEventListener("click", () => {
  notesModal.style.display = "none";
  activeBookId = null;
});

document.getElementById("saveNotesBtn").addEventListener("click", async () => {
  const notes = document.getElementById("notesInput").value.trim();
  if (!activeBookId) return;

  try {
    const res = await fetch(`/books/${activeBookId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    notesModal.style.display = "none";
    activeBookId = null;
    await getBooks();
  } catch (err) {
    console.error("Failed to save notes:", err);
    alert("Could not save notes. Is the server running?");
  }
});

// ─── OPEN BOOK MODAL ──────────────────────────────────────────────────────────
const openBookModalEl = document.getElementById("openBookModal");

function openBookModal(book) {
  document.getElementById("openBookTitle").textContent  = book.title;
  document.getElementById("openBookAuthor").textContent = book.author ? `by ${book.author}` : "";

  const current = book.current_page ?? 0;
  const total   = book.total_pages  ?? 0;
  document.getElementById("openBookProgress").textContent = `${current} / ${total} pages`;

  const quotesDiv = document.getElementById("openBookQuotes");
  quotesDiv.innerHTML = !book.quotes || book.quotes.length === 0
    ? "<p>No quotes yet.</p>"
    : book.quotes.map(q => `<p>"${q}"</p>`).join("");

  const notes = book.notes?.trim();
  document.getElementById("openBookNotes").textContent = notes || "No notes yet.";

  openBookModalEl.style.display = "block";
}

document.getElementById("openBookClose").addEventListener("click", () => {
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
  if (event.target === addBookModal) addBookModal.style.display = "none";
  if (event.target === quotesModal) {
    quotesModal.style.display = "none";
    activeBookId = null;
    document.getElementById("quoteInput").value = "";
  }
  if (event.target === notesModal) {
    notesModal.style.display = "none";
    activeBookId = null;
  }
  if (event.target === openBookModalEl) {
    openBookModalEl.style.display = "none";
  }
});

// ─── ADD BOOK ─────────────────────────────────────────────────────────────────
document.getElementById("saveBook").addEventListener("click", async () => {
  const title       = document.getElementById("titleInput").value.trim();
  const author      = document.getElementById("authorInput").value.trim();
  const totalPages  = parseInt(document.getElementById("totalPagesInput").value);
  const currentPage = parseInt(document.getElementById("currentPageInput").value) || 0;

  if (!title || isNaN(totalPages)) {
    alert("Please enter a valid title and total pages.");
    return;
  }
  if (currentPage < 0 || currentPage > totalPages) {
    alert(`Pages read must be between 0 and ${totalPages}.`);
    return;
  }

  try {
    const res = await fetch("/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, total_pages: totalPages, current_page: currentPage })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    // FIX: backend now returns global_streak on add — update the badge immediately
    const data = await res.json();
    renderGlobalStreak(data.global_streak);

    document.getElementById("titleInput").value       = "";
    document.getElementById("authorInput").value      = "";
    document.getElementById("totalPagesInput").value  = "";
    document.getElementById("currentPageInput").value = "";
    addBookModal.style.display = "none";

    await getBooks();
    await getStats();
  } catch (err) {
    console.error("Failed to add book:", err);
    alert("Could not save book. Is the server running?");
  }
});
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("statusFilter").addEventListener("change", applyFilters);
  document.getElementById("sortOption").addEventListener("change", applyFilters);
});
// ─── INIT ─────────────────────────────────────────────────────────────────────
getBooks();
getStats();
getGlobalStreak();