import { store } from "./store.js";
import { renderBooks } from "./main.js";
export function applyFilters() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  const filterValue = document.getElementById("statusFilter").value;
  const sortValue = document.getElementById("sortOption").value;
  const genreValue = document.getElementById("genreFilter").value.toLowerCase();

  let filtered = store.books.filter(book => {
    console.log(store.books.map(b => ({ title: b.title, genre: b.genre })));
    const matchesSearch = book.title.toLowerCase().includes(searchValue);
    const matchesGenre =
                      genreValue === "all" ||
                      !genreValue ||
                      (book.genre || "").toLowerCase() === genreValue;

    let status = "not-started";
    if (book.current_page === 0) status = "not-started";
    else if (book.current_page === book.total_pages) status = "completed";
    else status = "in-progress";

    const matchesFilter = filterValue === "all" || status === filterValue;

    return matchesSearch && matchesFilter && matchesGenre;
  });

  // 🔥 SORTING LOGIC


  // 📊 PROGRESS
  if (sortValue === "progress-asc") {
    filtered.sort((a, b) => {
      const progA = (a.current_page || 0) / (a.total_pages || 1);
      const progB = (b.current_page || 0) / (b.total_pages || 1);
      return progA - progB;
    });
  }

  if (sortValue === "progress-desc") {
    filtered.sort((a, b) => {
      const progA = (a.current_page || 0) / (a.total_pages || 1);
      const progB = (b.current_page || 0) / (b.total_pages || 1);
      return progB - progA;
    });
  }

  // 🕒 DATE (THIS IS WHAT YOU WANTED)
  if (sortValue === "date-desc") {
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }

  if (sortValue === "date-asc") {
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateA - dateB;
    });
  }

  renderBooks(filtered);
}