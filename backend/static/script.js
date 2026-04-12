const container = document.querySelector(".books-container");

let books = [];
let activeBookId = null;

// ─── FETCH ALL BOOKS ──────────────────────────────────────────────────────────
// Grab our shiny button
const toggleBtn = document.getElementById('dark-mode-toggle');

// Listen for the click!
toggleBtn.addEventListener('click', () => {
  // Tell the whole webpage body to put on its shades 😎
  document.body.classList.toggle('dark-theme');
  
  // A little silly extra: flip the button text!
  if (document.body.classList.contains('dark-theme')) {
    toggleBtn.textContent = '☀️ My eyes! Go back!';
  } else {
    toggleBtn.textContent = '🌙 Go Dark!';
  }
});
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
    background:#333; color:white; padding:12px 20px; border-radius:8px;
    font-size:14px; z-index:9999; opacity:1; transition:opacity 0.5s;
  `;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 500); }, 3000);
}
function getProgressColor(pct) {
  const hue = (pct / 100) * 270; // 0 → 270 (green → purple-ish)
  return `hsl(${hue}, 80%, 50%)`;
}
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
async function getColorsFromImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
      Vibrant.from(img).getPalette()
        .then(palette => resolve(palette))
        .catch(err => reject(err));
    };

    img.onerror = reject;
  });
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
    renderGlobalStreak(data.streak_count, data.last_read_date, data.freeze_count);
  } catch (err) {
    console.error("Failed to fetch global streak:", err);
  }
}

// CHECKS IF THE DAY HAS CHANGED (reschedule at next local midnight)
function scheduleMidnightCheck() {
  function scheduleNext() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    const delay = Math.max(0, nextMidnight - now);

    setTimeout(async () => {
      try {
        console.log("🌙 Midnight hit — updating streak");
        await getGlobalStreak();
      } finally {
        scheduleNext();
      }
    }, delay);
  }

  scheduleNext();
}
if (data.is_lost) {
  el.textContent = "💀 Streak frozen too long. Start again!";
}
//FUNCTION GLOBAL STREAK WARNING:
function renderGlobalStreak(count, lastReadDate, freezeCount) {
  
  const el = document.getElementById("globalStreak");
  if (!el) return;

  // 🧊 No streak yet
  if (!lastReadDate) {
    
      el.textContent = count === 0
        ? "💀 Your streak died. Start again!"
        : "Start your streak today!";
    
    el.classList.add("global-streak-badge--cold");
    el.classList.remove("global-streak-warning");
    return;
  }
  
  const today = new Date();
  const last = new Date(lastReadDate);

  // ⚠️ Normalize dates (VERY IMPORTANT)
  today.setHours(0,0,0,0);
  last.setHours(0,0,0,0);

  const diffDays = (today - last) / (1000 * 60 * 60 * 24);

  // 🚨 MISSED TODAY
  // ❌ Streak LOST (missed more than 1 day)
  

  // ❌ LOST
// 🧠 REAL LOGIC
const usableFreezes = freezeCount || 0;

// ❌ HARD LIMIT: more than 2 days → always lose
if (diffDays > 2) {
  el.textContent = "💀 Streak frozen too long. Start again!";
  el.classList.remove("global-streak-warning");
  el.classList.add("global-streak-badge--cold");
  return;
}

// ❌ USED MORE FREEZES THAN AVAILABLE
if (diffDays > usableFreezes + 1) {
  el.textContent = "💀 Out of freezes. Streak lost!";
  el.classList.remove("global-streak-warning");
  el.classList.add("global-streak-badge--cold");
  return;
}

// ⚠️ USING FREEZE RIGHT NOW
if (diffDays >= 1) {
  el.classList.add("global-streak-warning");
  el.classList.remove("global-streak-badge--cold");

  if (usableFreezes > 0) {
    el.textContent = `🧊 Using freeze (${usableFreezes} left) — don't break it bro`;
  } else {
    updateTimeLeft(lastReadDate);
  }

  return;
}

// 🔥 ACTIVE
if (count > 0) {
  el.textContent = `🔥 ${count} day streak`;
  if (freezeCount > 0) {
    el.textContent += ` 🧊 ${freezeCount}`;
  }
}

  // 🔥 ACTIVE STREAKz
  if (count > 0) {
    el.textContent = `🔥 ${count} day streak`;
    el.classList.remove("global-streak-warning");
    el.classList.remove("global-streak-badge--cold");
  } else {
    el.textContent = "Start your streak today!";
    el.classList.add("global-streak-badge--cold");
  }
  if (freezeCount > 0) {
    el.textContent += ` 🧊 ${freezeCount} freeze${freezeCount > 1 ? "s" : ""}`;
  }
} 
function updateTimeLeft(lastReadDate) {
  const el = document.getElementById("globalStreak");
  if (!el) return;

  if (!lastReadDate) return;

  const now = new Date();
  const last = new Date(lastReadDate);

  now.setHours(0,0,0,0);
  last.setHours(0,0,0,0);

  const diffDays = (now - last) / (1000 * 60 * 60 * 24);

  // 👉 Only show timer if user has NOT read today
  if (diffDays >= 1) {
    const current = new Date();

    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const msLeft = midnight - current;

    const hours = Math.floor(msLeft / (1000 * 60 * 60));
    const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

    el.textContent = `⏳ ${hours}h ${minutes}m left to save your streak`;
  }
}
function closeAll() {
  clearTheme();
  quotesModal.style.display = "none";
  notesModal.style.display = "none";
  openBookModalEl.style.display = "none";
}

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) closeAll();
});

// ─── RENDER BOOKS ─────────────────────────────────────────────────────────────

async function applyThemeFromCover(book) {
  if (typeof Vibrant === "undefined") {
    console.error("Vibrant STILL not loaded");
    return;
  }
  try {
    if (!book.cover_url || !book.cover_url.trim()) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = book.cover_url;

    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    const palette = await Vibrant.from(img).getPalette();

    const bg = palette.DarkVibrant?.hex || "#1e1e1e";
    const accent = palette.Vibrant?.hex || "#ffcc00";
    const text = palette.LightVibrant?.hex || "#ffffff";

    document.querySelectorAll(".modal-content").forEach(m => {
      m.style.background = `linear-gradient(135deg, ${bg}, ${accent})`;
      m.style.color = text;

      const btn = m.querySelector("button");
      if (btn) btn.style.background = accent;
    });

  } catch (err) {
    if (book.cover_url.startsWith("data:image")) {
      console.log("Base64 detected");
    }
    console.warn("Theme failed, fallback used:", err);
    
    // 🔥 fallback so modal STILL works
    document.querySelectorAll(".modal-content").forEach(m => {
      m.style.background = "linear-gradient(135deg, #2c3e50, #4ca1af)";
      m.style.color = "#fff";
    });
  }
}
function clearTheme() {
  document.querySelectorAll(".modal-content").forEach(m => {
    m.style.background = "";
    m.style.color = "";

    const btn = m.querySelector("button");
    if (btn) btn.style.background = "";
  });
}
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
    // 🖼️ BOOK COVER
    if (book.cover_url) {
      const coverDiv = document.createElement("div");
      coverDiv.classList.add("book-cover");
      coverDiv.style.backgroundImage = `url(${book.cover_url})`;
      card.appendChild(coverDiv);
    }
    console.log("book", book);
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
    console.log("Current Progress:", pct, "Color:", getProgressColor(pct));
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");

    const progressFill = document.createElement("div");
    progressFill.classList.add("progress");

    // 🟡 STEP 1: initial state
    progressFill.style.width = "0%";
    progressFill.style.backgroundColor = getProgressColor(0);

    progressBar.appendChild(progressFill);

    // 🟢 STEP 2: add to DOM (IMPORTANT)
    container.appendChild(progressBar); // use your actual container

    // 🔵 STEP 3: FORCE browser to register initial state
    progressFill.offsetWidth;

    // 🔴 STEP 4: now animate
    requestAnimationFrame(() => {
      progressFill.style.width = `${progress}%`;
      progressFill.style.backgroundColor = getProgressColor(pct);
    });

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
        if (!data.qualified_for_streak) {
          showToast("📖 Read at least 2 pages to count for streak!");
        }
        await getGlobalStreak(); // fetches fresh streak_count + last_read_date together
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
  const genreValue = document.getElementById("genreFilter").value.toLowerCase();

  let filtered = books.filter(book => {
    console.log(books.map(b => ({ title: b.title, genre: b.genre })));
    const matchesSearch = book.title.toLowerCase().includes(searchValue);
    const matchesGenre = !genreValue || (book.genre || "").toLowerCase() === genreValue.toLowerCase();

    let status = "not-started";
    if (book.current_page === 0) status = "not-started";
    else if (book.current_page === book.total_pages) status = "completed";
    else status = "in-progress";

    const matchesFilter = filterValue === "all" || status === filterValue;

    return matchesSearch && matchesFilter && matchesGenre;
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

async function openQuotesModal(book) {
  activeBookId = book.id;
  document.getElementById("quotesModalTitle").textContent = book.title;
  renderQuotesList(book.quotes || []);
  quotesModal.style.display = "block";
  await applyThemeFromCover(book);
  
}

function renderQuotesList(quotes) {
  document.getElementById("quotesCount").textContent = quotes.length;
  document.getElementById("quotesList").innerHTML = quotes.length === 0
    ? `<p class="no-quotes">No quotes yet. Add one below.</p>`
    : quotes.map(q => `<div class="quote-item">&#8220;${q}&#8221;</div>`).join("");
  document.getElementById("addQuoteArea").style.display = quotes.length >= 5 ? "none" : "block";
}

document.getElementById("quotesClose").addEventListener("click", () => {
  clearTheme();
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

async function openNotesModal(book) {
  activeBookId = book.id;
  document.getElementById("notesModalTitle").textContent = `Notes — ${book.title}`;
  const existing = book.notes || "";
  document.getElementById("notesInput").value = existing;
  document.getElementById("notesWordCount").textContent = countWords(existing);
  notesModal.style.display = "block";
  await applyThemeFromCover(book);
  
}

document.getElementById("notesInput").addEventListener("input", () => {
  const textarea = document.getElementById("notesInput");
  const words    = textarea.value.trim() === "" ? [] : textarea.value.trim().split(/\s+/);
  if (words.length > 500) textarea.value = words.slice(0, 500).join(" ");
  document.getElementById("notesWordCount").textContent = Math.min(words.length, 500);
});

document.getElementById("notesClose").addEventListener("click", () => {
  clearTheme()
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

async function openBookModal(book) {
  document.getElementById("openBookTitle").textContent  = book.title;
  document.getElementById("openBookAuthor").textContent = book.author ? `by ${book.author}` : "";
  openBookModalEl.style.display = "block";
  await applyThemeFromCover(book);
  const current = book.current_page ?? 0;
  const total   = book.total_pages  ?? 0;
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
  if (event.target === addBookModal) {addBookModal.style.display = "none";clearTheme(); }
  if (event.target === quotesModal) {
    quotesModal.style.display = "none";
    activeBookId = null;
    document.getElementById("quoteInput").value = "";
    clearTheme();
  }
  if (event.target === notesModal) {
    notesModal.style.display = "none";
    activeBookId = null;
    clearTheme();
  }
  if (event.target === openBookModalEl) {
    openBookModalEl.style.display = "none";
    clearTheme();
  }
});

// ─── ADD BOOK ─────────────────────────────────────────────────────────────────
document.getElementById("saveBook").addEventListener("click", async () => {
  const title       = document.getElementById("titleInput").value.trim();
  const author      = document.getElementById("authorInput").value.trim();
  const cover = document.getElementById("coverInput").value.trim();
  console.log("COVER INPUT:", cover);
  const totalPages  = parseInt(document.getElementById("totalPagesInput").value);
  const currentPage = parseInt(document.getElementById("currentPageInput").value) || 0;
  const genre = document.getElementById("genreInput").value;

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
      body: JSON.stringify({ title, author, total_pages: totalPages, current_page: currentPage, genre, cover_url: cover  })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    await res.json();

    await getGlobalStreak();

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
setInterval(async () => {
  await getGlobalStreak(); // refresh every minute
}, 60000);
document.addEventListener("DOMContentLoaded", () => {
  getBooks();
  getStats();
  getGlobalStreak();
  scheduleMidnightCheck();
});