import { API } from "../api_service/api.js";
import { applyFilters } from "../filters.js";
import { store } from "../store.js";

export const container = document.querySelector(".books-container");

export async function getBooks() {
  try {
    // 1. Fetch data safely from your API service
    store.books = await API.getBooks() || [];
    
    // 2. Apply filters to display the books on your UI
    applyFilters();
  } catch (error) {
    console.error("Failed to fetch books:", error.message);
    console.error("Response status hint — check Network tab for /books status code");
    
    if (container) {
      container.innerHTML = "<p>Could not load books. Is the server running?</p>";
    }
  }
}
