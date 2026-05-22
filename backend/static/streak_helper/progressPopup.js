import { TOAST } from "../shows_message/toast.js";
import { API } from "../api_service/api.js";
import { store } from "../store.js";

import { getBooks } from "../main.js";

import { getChallenges }
  from "../modal_helper/challengeModal.js";

import { getStats }
  from "../modal_helper/statsModal.js";

import { getGlobalStreak }
  from "./streak_helper.js";

// ─── SHOW PROGRESS INPUT ────────────────────────────────────────────────────
export function showProgressInput(
  book,
  currentPage,
  totalPages
) {

  const popup = document.createElement("div");

  popup.className = "mini-progress-popup";

  popup.innerHTML = `

    <h3>🌿 ${book.title}</h3>

    <p>
      Current: ${currentPage} / ${totalPages}
    </p>

    <input
      type="number"
      class="page-input"
      value="${currentPage}"
      min="0"
      max="${totalPages}"
    >

    <div class="popup-actions">

      <button class="save-btn">
        Save
      </button>

      <button class="cancel-btn">
        Cancel
      </button>

    </div>

  `;

  document.body.appendChild(popup);

  const input =
    popup.querySelector(".page-input");

  const saveBtn =
    popup.querySelector(".save-btn");

  const cancelBtn =
    popup.querySelector(".cancel-btn");

  // ─── CANCEL ──────────────────────────────────────────────────────────────
  cancelBtn.onclick = () => popup.remove();

  // ─── SAVE ────────────────────────────────────────────────────────────────
  saveBtn.onclick = async () => {

    const newPage = parseInt(input.value);

    // ─── VALIDATION ────────────────────────────────────────────────────────
    if (isNaN(newPage)) {

      TOAST.showToast(
        "Enter a valid number 📘"
      );

      return;

    }

    if (
      newPage < 0 ||
      newPage > totalPages
    ) {

      TOAST.showToast(
        `Enter between 0 and ${totalPages}`
      );

      return;

    }

    // ─── LOADING STATE ─────────────────────────────────────────────────────
    saveBtn.disabled = true;

    saveBtn.textContent = "Updating...";

    try {

      const json =
        await API.updateProgress(
          book.id,
          newPage
        );

      const data = json.data;

      // ─── STREAK CHECKS ───────────────────────────────────────────────────
      if (
        data &&
        !data.qualified_for_streak &&
        data.global_streak === 0
      ) {

        TOAST.showToast(
          "📖 Read at least 2 pages to count for streak!"
        );

      }

      if (
        data &&
        data.global_streak >
        store.lastKnownGlobalStreak
      ) {

        TOAST.showToast(
          `🔥 ${data.global_streak}-day global streak!`
        );

      }

      popup.remove();

      // ─── REFRESH UI ──────────────────────────────────────────────────────
      await getBooks();

      await getChallenges();

      await getStats();

      await getGlobalStreak();

    } catch (err) {

      console.error(
        "Failed to update progress:",
        err
      );

      TOAST.showToast(
        "Could not update progress."
      );

    } finally {

      saveBtn.disabled = false;

      saveBtn.textContent = "Save";

    }

  };

  input.focus();

}