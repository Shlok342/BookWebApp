// quotesModal.js

import { store } from "../store.js";
import { API } from "../api_service/api.js";

import { TOAST } from "../shows_message/toast.js";

import {
  applyThemeFromCover,
  clearTheme
} from "../theme.js";

import { getBooks } from "./getBooks.js";

const quotesModal = document.getElementById("quotesModal");



// =========================
// OPEN MODAL
// =========================

export async function openQuotesModal(book) {
  store.activeBookId = book.id;

  document.getElementById("quotesModalTitle").textContent =
    book.title;

  renderQuotesList(book.quotes || []);

  quotesModal.style.display = "block";

  await applyThemeFromCover(book);
}



// =========================
// RENDER QUOTES
// =========================

export function renderQuotesList(quotes) {
  document.getElementById("quotesCount").textContent =
    quotes.length;

  document.getElementById("quotesList").innerHTML =
    quotes.length === 0
      ? `<p class="no-quotes">No quotes yet. Add one below.</p>`
      : quotes
          .map(
            q => `
              <div class="quote-item">
                &#8220;${q}&#8221;
              </div>
            `
          )
          .join("");

  document.getElementById("addQuoteArea").style.display =
    quotes.length >= 5 ? "none" : "block";
}



// =========================
// INITIALIZE EVENT LISTENERS
// =========================

export function initQuotesModal() {

  // CLOSE MODAL
  document
    .getElementById("quotesClose")
    .addEventListener("click", () => {

      clearTheme();

      quotesModal.style.display = "none";

      store.activeBookId = null;

      document.getElementById("quoteInput").value = "";
    });



  // ADD QUOTE
  document
    .getElementById("addQuoteBtn")
    .addEventListener("click", async () => {

      const text =
        document.getElementById("quoteInput")
          .value
          .trim();

      const book = store.books.find(
        b => b.id === store.activeBookId
      );

      const quotes = [...(book?.quotes || [])];



      // VALIDATION
      if (!text || !book) return;

      if (quotes.length >= 5) {
        TOAST.showToast(
          "Maximum 5 quotes per book."
        );
        return;
      }



      // ADD NEW QUOTE
      quotes.push(text);



      try {

        const data = await API.updateQuotes(
          store.activeBookId,
          quotes
        );



        // STREAK TOAST
        if (data.streak_count > 1) {
          TOAST.showToast(
            `🔥 ${data.streak_count}-day reading streak!`
          );
        }



        // CLEAR INPUT
        document.getElementById("quoteInput").value = "";



        // REFRESH BOOKS
        await getBooks();



        // RE-RENDER
        const updated = store.books.find(
          b => b.id === store.activeBookId
        );

        if (updated) {
          renderQuotesList(updated.quotes || []);
        }

      } catch (err) {

        console.error(
          "Failed to save quote:",
          err
        );

        TOAST.showToast(
          "Could not save quote."
        );
      }
    });
}