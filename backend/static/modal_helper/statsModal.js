import { API } from "../api_service/api.js";

const statsModal = document.getElementById("statsModal");

// ─── FETCH + RENDER STATS ──────────────────────────────────────────────────
export async function getStats() {

  try {

    const data = await API.getStats();

    // ─── MAIN STATS ────────────────────────────────────────────────────────
    document.getElementById("totalBooks").textContent =
      data.total_books;

    document.getElementById("totalPages").textContent =
      data.total_pages_read;

    document.getElementById("monthlyPages").textContent =
      data.pages_this_month;

    document.getElementById("avgPages").textContent =
      data.avg_pages_per_month;

    // ─── MINI STATS ────────────────────────────────────────────────────────
    document.getElementById("miniBooks").textContent =
      data.total_books;

    document.getElementById("miniPages").textContent =
      data.total_pages_read;

    document.getElementById("miniMonth").textContent =
      data.pages_this_month;

    // ─── STREAK STATS ──────────────────────────────────────────────────────
    document.getElementById("streakPages").textContent =
      data.streak_pages_read;

    document.getElementById("streakMonthly").textContent =
      data.streak_pages_this_month;

    document.getElementById("streakAvg").textContent =
      data.avg_streak_pages_per_month;

  } catch (err) {

    console.error("Stats error:", err);

  }
}

// ─── OPEN MODAL ────────────────────────────────────────────────────────────
document.getElementById("openStats")
  .addEventListener("click", () => {

    statsModal.style.display = "flex";

});

// ─── CLOSE MODAL ───────────────────────────────────────────────────────────
document.getElementById("closeStats")
  .addEventListener("click", () => {

    statsModal.style.display = "none";

});

// ─── OUTSIDE CLICK CLOSE ───────────────────────────────────────────────────
window.addEventListener("click", (e) => {

  if (e.target === statsModal) {

    statsModal.style.display = "none";

  }

});