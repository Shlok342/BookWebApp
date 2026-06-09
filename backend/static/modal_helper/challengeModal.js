import { API } from "../api_service/api.js";

const challengeModal =
  document.getElementById("challengeModal");

const challengeBtn =
  document.getElementById("challengeBtn");

const challengeClose =
  document.getElementById("challengeClose");

// ─── FETCH CHALLENGES ──────────────────────────────────────────────────────
export async function getChallenges() {

  try {

    const data = await API.getChallenges();

    renderChallenges(data);

  } catch (err) {

    console.error(
      "Failed to fetch challenges:",
      err
    );

  }

}

// ─── RENDER CHALLENGES ─────────────────────────────────────────────────────

  // ─── DAILY ───────────────────────────────────────────────────────────────
  function renderChallenges(challenges) {

    const container =
      document.getElementById("challengesContainer");
  
    container.innerHTML = challenges.map(challenge => `
  
      <div class="challenge-card ${
        challenge.completed ? "done" : ""
      }">
  
        <h3>
          ${
            challenge.completed
              ? "☀️"
              : "📖"
          }
          ${challenge.title}
        </h3>
  
        <p>
          ${challenge.description}
        </p>
  
      </div>
  
    `).join("");
  
  }

// ─── OPEN MODAL ────────────────────────────────────────────────────────────
challengeBtn.addEventListener(
  "click",
  async () => {

    await getChallenges();

    challengeModal.style.display = "block";

  }
);

// ─── CLOSE MODAL ───────────────────────────────────────────────────────────
challengeClose.addEventListener(
  "click",
  () => {

    challengeModal.style.display = "none";

  }
);