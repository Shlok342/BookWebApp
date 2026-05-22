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
function renderChallenges(data) {

  const progressPercent = Math.min(
    (data.monthly.progress / 2) * 100,
    100
  );

  // ─── DAILY ───────────────────────────────────────────────────────────────
  document.getElementById("dailyChallenge").innerHTML = `

    <div class="challenge-card ${
      data.daily.completed ? "done" : ""
    }">

      <h3>📅 Daily Challenge</h3>

      <p>
        ${
          data.daily.completed
            ? "✅ Completed!"
            : "Read 20 pages in one session"
        }
      </p>

    </div>

  `;

  // ─── MONTHLY ─────────────────────────────────────────────────────────────
  document.getElementById("monthlyChallenge").innerHTML = `

    <div class="challenge-card ${
      data.monthly.completed ? "done" : ""
    }">

      <h3>📚 Monthly Challenge</h3>

      <div class="progress-bar">

        <div
          class="progress"
          style="width:${progressPercent}%"
        ></div>

      </div>

      <p>${data.monthly.progress} / 2 books</p>

    </div>

  `;
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