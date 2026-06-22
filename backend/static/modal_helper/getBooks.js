import { API } from "../api_service/api.js";
import { applyFilters } from "../filters.js";
import { store } from "../store.js";
export const container = document.querySelector(".books-container");
export async function getBooks() {
    try {
      store.books = await API.getBooks() || [];
      applyFilters();
    } catch (error) {
      console.error("Failed to fetch books:", error.message);  // already there
      // ADD THIS:
      console.error("Response status hint — check Network tab for /books status code");
      container.innerHTML = "<p>Could not load books. Is the server running?</p>";
    }
  }