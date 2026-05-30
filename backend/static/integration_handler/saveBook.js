import { TOAST } from "../shows_message/toast.js";
import { API } from "../api_service/api.js";
import { getBooks } from "../modal_helper/getBooks.js";
import { getStats } from "../modal_helper/statsModal.js";
import { addBookModal } from "../circular_import_helper.js";
import { closeModal } from "../close.js";
export async function saveBookHandler() {

  const saveBookBtn =
    document.getElementById("saveBook");

  const totalPages = parseInt(
    document.getElementById("totalPagesInput").value
  );

  const currentPage = parseInt(
    document.getElementById("currentPageInput").value
  ) || 0;

  const genre =
    document.getElementById("genreInput").value;

  const title =
    document.getElementById("titleInput").value.trim();

  const author =
    document.getElementById("authorInput").value.trim();

  const cover =
    document.getElementById("coverInput").value.trim();

  if (!title || isNaN(totalPages)) {
    TOAST.showToast(
      "Please enter a valid title and total pages."
    );
    return;
  }

  if (currentPage < 0 || currentPage > totalPages) {
    TOAST.showToast(
      `Pages read must be between 0 and ${totalPages}.`
    );
    return;
  }

  saveBookBtn.disabled = true;
  saveBookBtn.textContent = "Saving...";

  try {

    await API.addBook({
      title,
      author,
      total_pages: totalPages,
      current_page: currentPage,
      genre,
      cover_url: cover
    });

    closeModal(addBookModal);

    await getBooks();
    await getStats();

  } catch (err) {

    console.error(
      "Failed to add book:",
      err
    );

  } finally {

    saveBookBtn.disabled = false;
    saveBookBtn.textContent = "Save Book";

  }
}
