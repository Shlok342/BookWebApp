import { API } from "../api_service/api.js";

const challengeModal = document.getElementById("challengeModal");
const challengeBtn = document.getElementById("challengeBtn");
const challengeClose = document.getElementById("challengeClose");

// ─── FETCH CHALLENGES ──────────────────────────────────────────────────────
export async function getChallenges() {
  try {
    const data = await API.getChallenges();
    renderChallenges(data);
  } catch (err) {
    console.error("Failed to fetch challenges:", err);
  }
}

// ─── HELPER: GET THEME CLASS ───────────────────────────────────────────────
// This checks the title string from Python to assign the right CSS theme
function getThemeClass(title) {
  const t = title.toLowerCase();
  if (t.includes("flame")) return "theme-flame";
  if (t.includes("frost")) return "theme-frost";
  if (t.includes("moonlit")) return "theme-moon";
  // Default for all the book/page related challenges
  return "theme-book"; 
}

// ─── RENDER CHALLENGES ─────────────────────────────────────────────────────
function renderChallenges(challenges) {
  const container = document.getElementById("challengesContainer");

  container.innerHTML = challenges.map(challenge => {
    // 1. Get our dynamic theme class
    const themeClass = getThemeClass(challenge.title);
    
    // 2. Check if it's done
    const doneClass = challenge.completed ? "done" : "";
    const statusText = challenge.completed ? "✅ Achieved" : "🔒 Locked";

    // 3. Return the HTML structure (maps perfectly to your CSS!)
    return `
      <div class="challenge-card ${doneClass} ${themeClass}">
        <h3>
          ${challenge.title}
        </h3>
        <p>
          ${challenge.description}
        </p>
        <div class="challenge-status">
          ${statusText}
        </div>
      </div>
    `;
  }).join("");
}

// ─── OPEN MODAL ────────────────────────────────────────────────────────────
challengeBtn.addEventListener("click", async () => {
  await getChallenges();
  challengeModal.style.display = "block";
});

// ─── CLOSE MODAL ───────────────────────────────────────────────────────────
challengeClose.addEventListener("click", () => {
  challengeModal.style.display = "none";
});