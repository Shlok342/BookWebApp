// notesModal.js

import { store } from "../store.js";

import { API } from "../api_service/api.js";

import { TOAST } from "../shows_message/toast.js";

import {
  applyThemeFromCover,
  clearTheme
} from "../theme.js";

import { getBooks } from "./getBooks.js";



export const notesModal = document.getElementById("notesModal");



// =========================
// WORD COUNT
// =========================

function countWords(text) {
  return text.trim() === ""
    ? 0
    : text.trim().split(/\s+/).length;
}



// =========================
// OPEN MODAL
// =========================

export async function openNotesModal(book) {

  store.activeBookId = book.id;

  document.getElementById("notesModalTitle")
    .textContent = `Notes — ${book.title}`;

  const existing = book.notes || "";

  document.getElementById("notesInput").value =
    existing;

  document.getElementById("notesWordCount")
    .textContent = countWords(existing);

  notesModal.style.display = "block";
  const modalContent =
  document.querySelector("#notesModal .modal-content");
  

  await applyThemeFromCover(book, modalContent);
 
  
}



// =========================
// INIT EVENT LISTENERS
// =========================

export function initNotesModal() {



  // LIVE WORD COUNT
  document
    .getElementById("notesInput")
    .addEventListener("input", () => {

      const textarea =
        document.getElementById("notesInput");

      const words =
        textarea.value.trim() === ""
          ? []
          : textarea.value
              .trim()
              .split(/\s+/);



      // LIMIT TO 500 WORDS
      if (words.length > 500) {

        textarea.value =
          words
            .slice(0, 500)
            .join(" ");
      }



      document.getElementById("notesWordCount")
        .textContent = Math.min(words.length, 500);
    });



  // CLOSE MODAL
  document
    .getElementById("notesClose")
    .addEventListener("click", () => {

      clearTheme();

      notesModal.style.display = "none";

      store.activeBookId = null;
    });



  // SAVE NOTES
  document
  .getElementById("saveNotesBtn")
  .addEventListener("click", async () => {

    const saveNotesBtn =
      document.getElementById("saveNotesBtn");

    const notes =
      document.getElementById("notesInput")
        .value
        .trim();

    if (!store.activeBookId) return;

    saveNotesBtn.disabled = true;
    saveNotesBtn.textContent = "Saving...";

    try {

      await API.updateNotes(
        store.activeBookId,
        notes
      );

      notesModal.style.display = "none";

      store.activeBookId = null;

      await getBooks();

    } catch (err) {

      console.error(
        "Failed to save notes:",
        err
      );

      TOAST.showToast(
        "Could not save notes. Is the server running?"
      );

    } finally {

      saveNotesBtn.disabled = false;
      saveNotesBtn.textContent = "Save Notes";

    }
});}