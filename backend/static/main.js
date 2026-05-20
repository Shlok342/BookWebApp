const container = document.querySelector(".books-container");
import { API } from "./api_service/api.js";
import { TOAST } from './shows_message/toast.js';
import { applyThemeFromCover, clearTheme } from "./theme.js";
import { applyFilters } from "./filters.js";
import { store } from "./store.js";
// Example usage inside main.js:

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
const tagsModal = document.getElementById("tagsModal");

const AVAILABLE_TAGS = ["⋆˙⟡ Witty", 
                        "𓆩❤︎𓆪 Romantic",
                        "˙◠˙ Total Sobfest",
                        "•ᴗ• Pure Joy",
                        ">ᴗ< Page Turner",
                        "♬ Vibe Check",
                        "𖡎 Brain Melt",
                        "☕︎ Slow Burn",
                        "♛ Instant Classic",
                        "ཐི༏ཋྀ Deep Dark",
                        "⚡︎⚡︎ Easy Breezy",
                        "✌︎㋡ Chef's Kiss"];
store.selectedTags = [];
// ─── FETCH ALL BOOKS ──────────────────────────────────────────────────────────
// Grab our shiny button
const toggleBtn = document.getElementById('dark-mode-toggle');

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    if (document.body.classList.contains('dark-theme')) {
      toggleBtn.textContent = '☀️ My eyes! Go back!';
    } else {
      toggleBtn.textContent = '🌙 Go Dark!';
    }
  });
}
// QUOTE OF THE DAY
const quoteModal = document.getElementById("quoteModal");
const quoteBtn = document.getElementById("quoteBtn");
const quoteClose = document.getElementById("quoteClose");

// CHALLENGES 
const challengeModal = document.getElementById("challengeModal");
const challengeBtn = document.getElementById("challengeBtn");
const challengeClose = document.getElementById("challengeClose");
challengeBtn.addEventListener("click", async () => {
  await getChallenges(); // always fresh
  challengeModal.style.display = "block";
});
challengeClose.addEventListener("click", () => {
  challengeModal.style.display = "none";
});
quoteBtn.onclick = async () => {
  quoteModal.style.display = "block";
  document.getElementById("quoteDayText").textContent = "Fetching wisdom...";
  document.getElementById("quoteDayAuthor").textContent = "";

  try {


    const data = await API.getQuote();

    document.getElementById("quoteDayText").textContent = data.quote;
    document.getElementById("quoteDayAuthor").textContent =
      data.author ? `— ${data.author}` : "";

  } catch (err) {
    console.error(err);
    document.getElementById("quoteDayText").textContent =
      "Could not load quote. Try again!";
  }
};

quoteClose.onclick = () => quoteModal.style.display = "none";

window.addEventListener("click", (e) => {
  if (e.target === quoteModal) quoteModal.style.display = "none";
  if (e.target === challengeModal) {
    challengeModal.style.display = "none";
  }
});
// ─── Botanical Delete Confirmation Popup ──────────────────────────────────────
function showDeleteConfirm(bookTitle) {
  return new Promise((resolve) => {
    // backdrop
    const overlay = document.createElement("div");
    overlay.className = "delete-confirm-overlay";

    // popup container
    const popup = document.createElement("div");
    popup.className = "delete-confirm-popup";

    popup.innerHTML = `
      <div class="delete-confirm-leaves">
        <span class="dc-leaf dc-leaf-1">🍂</span>
        <span class="dc-leaf dc-leaf-2">🌿</span>
        <span class="dc-leaf dc-leaf-3">🍃</span>
      </div>
      <div class="delete-confirm-icon">🥀</div>
      <h3 class="delete-confirm-title">Let this one go?</h3>
      <p class="delete-confirm-book">"${bookTitle}"</p>
      <p class="delete-confirm-msg">This book will be removed from your sanctuary.<br>This cannot be undone.</p>
      <div class="delete-confirm-actions">
        <button class="dc-cancel-btn">Keep it 🌱</button>
        <button class="dc-delete-btn">Remove 🍂</button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // force reflow then add visible class for animation
    overlay.offsetWidth;
    overlay.classList.add("dc-visible");

    const cleanup = (result) => {
      overlay.classList.remove("dc-visible");
      overlay.classList.add("dc-closing");
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 280);
    };

    popup.querySelector(".dc-cancel-btn").addEventListener("click", () => cleanup(false));
    popup.querySelector(".dc-delete-btn").addEventListener("click", () => cleanup(true));

    // clicking backdrop = cancel
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup(false);
    });

    // ESC key = cancel
    const escHandler = (e) => {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", escHandler);
        cleanup(false);
      }
    };
    document.addEventListener("keydown", escHandler);
  });
}
function getProgressColor(pct) {
  const hue = (pct / 100) * 270;
  return `hsl(${hue}, 80%, 50%)`;
}
async function getBooks() {
  try {
    store.books = await API.getBooks();
    applyFilters();
  } catch (error) {
    console.error("Failed to fetch books:", error);
    container.innerHTML = "<p>Could not load books. Is the server running?</p>";
  }
}
async function getChallenges() {
  const data = await API.getChallenges();
  renderChallenges(data);
}

function renderChallenges(data) {
  const progressPercent = Math.min((data.monthly.progress / 2) * 100, 100);

  document.getElementById("dailyChallenge").innerHTML = `
    <div class="challenge-card ${data.daily.completed ? "done" : ""}">
      <h3>📅 Daily Challenge</h3>
      <p>
        ${data.daily.completed ? "✅ Completed!" : "Read 20 pages in one session"}
      </p>
    </div>
  `;

  document.getElementById("monthlyChallenge").innerHTML = `
    <div class="challenge-card ${data.monthly.completed ? "done" : ""}">
      <h3>📚 Monthly Challenge</h3>

      <div class="progress-bar">
        <div class="progress" style="width:${progressPercent}%"></div>
      </div>

      <p>${data.monthly.progress} / 2 books</p>
    </div>
  `;
}
// ─── FETCH STATS ──────────────────────────────────────────────────────────────
// FIX: was using `${BASE_URL}/stats` (full origin URL) — everything else uses
//      a relative path, so this was inconsistent and would break behind a proxy.
async function getStats() {
  try {
    console.log("Fetching stats...");



    const data = await API.getStats();
    console.log("DATA:", data);

    document.getElementById("totalBooks").textContent = data.total_books;
    document.getElementById("totalPages").textContent = data.total_pages_read;
    document.getElementById("monthlyPages").textContent = data.pages_this_month;
    document.getElementById("avgPages").textContent = data.avg_pages_per_month;
    document.getElementById("miniBooks").textContent = data.total_books;
    document.getElementById("miniPages").textContent = data.total_pages_read;
    document.getElementById("miniMonth").textContent = data.pages_this_month;

    console.log("Old stats done ✅");
    console.log(book.tags);
    // 🔥 wrap new ones
    console.log("Trying new stats...");

    document.getElementById("streakPages").textContent = data.streak_pages_read;
    document.getElementById("streakMonthly").textContent = data.streak_pages_this_month;
    document.getElementById("streakAvg").textContent = data.avg_streak_pages_per_month;

    console.log("New stats done ✅");

  } catch (err) {
    console.error("Stats error:", err);
  }
}
const statsModal = document.getElementById("statsModal");

document.getElementById("openStats").addEventListener("click", () => {
  statsModal.style.display = "flex";
});

document.getElementById("closeStats").addEventListener("click", () => {
  statsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === statsModal) {
    statsModal.style.display = "none";
  }
});
// ─── FETCH GLOBAL STREAK ──────────────────────────────────────────────────────
async function getGlobalStreak() {
  try {
    const data = await API.getGlobalStreak();
    // #region agent log
    fetch("http://127.0.0.1:7490/ingest/dc227871-b4dc-4521-8755-f48980c0dcae", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f3a808" },
      body: JSON.stringify({
        sessionId: "f3a808",
        location: "script.js:getGlobalStreak",
        message: "GET /streak response",
        data: {
          streak_count: data.streak_count,
          last_read_date: data.last_read_date,
          freeze_count: data.freeze_count,
        },
        hypothesisId: "H_streak_ui",
        timestamp: Date.now(),
      }),
    }).catch(() => { });
    // #endregion
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

//FUNCTION GLOBAL STREAK WARNING:
function renderGlobalStreak(count, lastReadDate, freezeCount) {
  const el = document.getElementById("globalStreak");
  if (!el) return;

  const setCold = (msg) => {
    el.textContent = msg;
    el.classList.add("global-streak-badge--cold");
    el.classList.remove("global-streak-warning");
  };

  const setActive = (msg) => {
    el.textContent = msg;
    el.classList.remove("global-streak-badge--cold");
    el.classList.remove("global-streak-warning");
  };

  if (!lastReadDate) {
    setCold(count === 0 ? "💀 Your streak died. Start again!" : "Start your streak today!");
    return;
  }

  const today = new Date();
  const last = new Date(lastReadDate);

  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  const diffDays = (today - last) / (1000 * 60 * 60 * 24);
  store.lastKnownGlobalStreak = count;
  const usableFreezes = freezeCount || 0;

  // ── Read today ──
  if (diffDays === 0) {
    let msg = `🔥 ${count} day streak`;
    if (usableFreezes > 0) {
      msg += ` 🧊 ${usableFreezes} freeze${usableFreezes > 1 ? "s" : ""}`;
    }
    setActive(msg);
    return;
  }

  // ── Day 2 → freeze applies OR streak breaks ──
  if (diffDays === 2) {
    if (usableFreezes > 0) {
      el.textContent = `🧊 Freeze will be used if you don’t read today (${usableFreezes} left)`;
      el.classList.add("global-streak-warning");
      el.classList.remove("global-streak-badge--cold");
    } else {
      setCold("💀 Streak lost!");
    }
    return;
  }

  // ── Beyond recovery ──
  if (diffDays > 2) {
    setCold("💀 Streak lost!");
    return;
  }

  // ── Day 1 → warning (freeze irrelevant here) ──
  if (diffDays === 1) {
    updateTimeLeft(lastReadDate);
    el.classList.add("global-streak-warning");
    el.classList.remove("global-streak-badge--cold");
  }
}

function updateTimeLeft(lastReadDate) {
  const el = document.getElementById("globalStreak");
  if (!el) return;

  if (!lastReadDate) return;

  const now = new Date();
  const last = new Date(lastReadDate);

  now.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

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
// ─── RENDER BOOKS ─────────────────────────────────────────────────────────────
function renderTagOptions() {
  const container = document.getElementById("tagsContainer");

  container.innerHTML = "";

  // Add an array of awesome colors at the top
  const chipColors = [
    "#dfccfb", // ⋆˙✧ Witty (Playful lavender)
    "#c4e4c5", // ʚ💚ɞ Romantic (Soft sage green to match the heart!)
    "#b3c5ff", // ˙◠˙ Total Sobfest (Melancholic tear-drop blue)
    "#fdedb3", // •ᴗ• Pure Joy (Warm sunshine yellow)
    "#ffbfa3", // >u< Page Turner (Exciting coral peach)
    "#bffee9", // ♬ Vibe Check (Chilled-out minty teal)
    "#e8bcf0", // 🧠 Brain Melt (Trippy cosmic orchid)
    "#e1c7a5", // ☕ Slow Burn (Warm cozy espresso brown)
    "#f3da90", // 👑 Instant Classic (Regal vintage gold)
    "#a3b0cc", // 🦋 Deep Dark (Mysterious twilight slate)
    "#c3ebf7", // ⚡⚡ Easy Breezy (Light crisp sky blue)
    "#fca5a5"  // ✌︎ッ Chef's Kiss (Flawless gourmet rose)
];

// Update your loop to grab the index
AVAILABLE_TAGS.forEach((tag, index) => {
    const chip = document.createElement("span");
    chip.classList.add("tag-chip");

    // Assign a color based on the index (modulo keeps it from breaking if you have more tags than colors!)
    const assignedColor = chipColors[index % chipColors.length];
    chip.style.setProperty("--custom-color", assignedColor);

    if (store.selectedTags.includes(tag)) {
        chip.classList.add("active");
    }

    chip.textContent = tag;
    
    // ... rest of your click listener and append code stays exactly the same!

    chip.addEventListener("click", () => {
      if (store.selectedTags.includes(tag)) {
        store.selectedTags = store.selectedTags.filter(t => t !== tag);
      } else {
        if (store.selectedTags.length >= 3) {
           TOAST.showToast("You can only select up to 3 tags.");
          return;
        }
      
        store.selectedTags.push(tag);
      }

      renderTagOptions();
    });

    container.appendChild(chip);
  });
}
document.getElementById("saveTagsBtn").addEventListener("click", async () => {
  if (!store.activeBookId) return;

  try{
    await fetch(`/books/${store.activeBookId}/tags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: store.selectedTags })
      
    })
    tagsModal.style.display = "none";
    store.activeBookId = null;
    await getBooks();

  }
  catch (err) {
    console.error("Failed to save tags:", err);
  }});
document.getElementById("tagsClose").addEventListener("click", () => {
  tagsModal.style.display = "none";
  store.activeBookId = null;
});
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
const quotesModal = document.getElementById("quotesModal");
const addBookModal = document.getElementById("addBookModal");

async function openQuotesModal(book) {
  store.activeBookId = book.id;
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
  store.activeBookId = null;
  document.getElementById("quoteInput").value = "";
});

document.getElementById("addQuoteBtn").addEventListener("click", async () => {
  const text = document.getElementById("quoteInput").value.trim();
  const book = store.books.find(b => b.id === store.activeBookId);
  const quotes = [...(book?.quotes || [])];

  if (!text || !book) return;
  if (quotes.length >= 5) {
     TOAST.showToast("Maximum 5 quotes per book.");
    return;
  }

  quotes.push(text);

  try {
    const data = await API.updateQuotes(store.activeBookId, quotes);

    if (data.streak_count > 1) {
       TOAST.showToast(`🔥 ${data.streak_count}-day reading streak!`);
    }

    document.getElementById("quoteInput").value = "";

    await getBooks();

    const updated = store.books.find(b => b.id === store.activeBookId);
    if (updated) renderQuotesList(updated.quotes || []);

  } catch (err) {
    console.error("Failed to save quote:", err);
    TOAST.showToast("Could not save quote.");
  }
});

// ─── NOTES MODAL ──────────────────────────────────────────────────────────────
const notesModal = document.getElementById("notesModal");

function countWords(text) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

async function openNotesModal(book) {
  store.activeBookId = book.id;
  document.getElementById("notesModalTitle").textContent = `Notes — ${book.title}`;
  const existing = book.notes || "";
  document.getElementById("notesInput").value = existing;
  document.getElementById("notesWordCount").textContent = countWords(existing);
  notesModal.style.display = "block";
  await applyThemeFromCover(book);

}

document.getElementById("notesInput").addEventListener("input", () => {
  const textarea = document.getElementById("notesInput");
  const words = textarea.value.trim() === "" ? [] : textarea.value.trim().split(/\s+/);
  if (words.length > 500) textarea.value = words.slice(0, 500).join(" ");
  document.getElementById("notesWordCount").textContent = Math.min(words.length, 500);
});

document.getElementById("notesClose").addEventListener("click", () => {
  clearTheme()
  notesModal.style.display = "none";
  store.activeBookId = null;
});

document.getElementById("saveNotesBtn").addEventListener("click", async () => {
  const notes = document.getElementById("notesInput").value.trim();
  if (!store.activeBookId) return;

  try {
    await API.updateNotes(store.activeBookId, notes);

    notesModal.style.display = "none";
    store.activeBookId = null;

    await getBooks();

  } catch (err) {
    console.error("Failed to save notes:", err);
    TOAST.showToast("Could not save notes. Is the server running?");
  }
});

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
