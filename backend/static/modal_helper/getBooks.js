import { API } from "../api_service/api.js";
import { applyFilters } from "../filters.js";
import { store } from "../store.js";
export const container = document.querySelector(".books-container");
export async function getBooks() {
    try {
      store.books = await API.getBooks();
      applyFilters();
    } catch (error) {
      console.error("Failed to fetch books:", error);
      container.innerHTML = "<p>Could not load books. Is the server running?</p>";
    }
  }