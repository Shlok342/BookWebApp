// quoteOfDayModal.js

import {API} from "../api_service/api.js";



const quoteBtn =
  document.getElementById("quoteBtn");

const quoteModal =
  document.getElementById("quoteModal");

const quoteClose =
  document.getElementById("quoteClose");



// =========================
// INIT
// =========================

export function initQuoteOfDayModal() {



  // OPEN MODAL
  quoteBtn.addEventListener("click", async () => {

    quoteModal.style.display = "block";

    document.getElementById("quoteDayText")
      .textContent = "Fetching wisdom...";

    document.getElementById("quoteDayAuthor")
      .textContent = "";



    try {

      const data = await API.getQuote();



      document.getElementById("quoteDayText")
        .textContent = data.quote;



      document.getElementById("quoteDayAuthor")
        .textContent =
          data.author
            ? `— ${data.author}`
            : "";



    } catch (err) {

      console.error(err);

      document.getElementById("quoteDayText")
        .textContent =
          "Could not load quote. Try again!";
    }
  });



  // CLOSE BUTTON
  quoteClose.addEventListener("click", () => {

    quoteModal.style.display = "none";
  });



  // CLICK OUTSIDE TO CLOSE
  quoteModal.addEventListener("click", (e) => {

    if (e.target === quoteModal) {

      quoteModal.style.display = "none";
    }
  });
}