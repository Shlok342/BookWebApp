import { applyThemeFromCover, clearTheme } from "../theme.js";
const openBookModalEl = document.getElementById("openBookModal");
export async function openBookModal(book) {
  document.getElementById("openBookTitle").textContent = book.title;
  document.getElementById("openBookAuthor").textContent = book.author ? `by ${book.author}` : "";
  openBookModalEl.style.display = "block";
  await applyThemeFromCover(book);
  const current = book.current_page ?? 0;
  const total = book.total_pages ?? 0;
  document.getElementById("openBookProgress").textContent = `${current} / ${total} pages`;

  const quotesDiv = document.getElementById("openBookQuotes");
  quotesDiv.innerHTML = !book.quotes || book.quotes.length === 0
    ? "<p>No quotes yet.</p>"
    : book.quotes.map(q => `<p>"${q}"</p>`).join("");

  const notes = book.notes?.trim();
  document.getElementById("openBookNotes").textContent = notes || "No notes yet.";


}
window.addEventListener("click", (event) => {
    if (event.target === openBookModalEl) {
       openBookModalEl.style.display = "none";
       clearTheme();
    }
 });
document.getElementById("openBookClose").addEventListener("click", () => {
  clearTheme();
  openBookModalEl.style.display = "none";
});