import { openNotesModal} from "../modal_helper/notesModal.js";
import { openBookModal} from "../integration_handler/open_book.js";
import { openQuotesModal} from "../modal_helper/quotesModal.js";
import { showDeleteConfirm } from "../frontend_helpers/show_delete_popup.js";
import { renderTagOptions } from "../modal_helper/tagsModal.js";
import { getStats} from "../modal_helper/statsModal.js";
import { getBooks } from "../modal_helper/getBooks.js";
import { API } from "../api_service/api.js";
import { TOAST } from "../shows_message/toast.js";
import { store} from "../store.js";
export function createCardButtons(book){
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("book-card-buttons");
    const openBtn = document.createElement("button");
        openBtn.classList.add("open-btn");
        openBtn.textContent = "Open";
        openBtn.addEventListener("click", () => openBookModal(book));
        const tagBtn = document.createElement("button");
        tagBtn.classList.add("tag-btn");
        tagBtn.textContent = "Tags";
    
    tagBtn.addEventListener("click", () => {
    store.activeBookId = book.id;
    store.selectedTags = [...(book.tags || [])];
    
    renderTagOptions();
    const tagsModal = document.getElementById("tagsModal");
    tagsModal.style.display = "block";
        });
    const quotesBtn = document.createElement("button");
    quotesBtn.classList.add("quotes-btn");
    quotesBtn.textContent = "Quotes";
    quotesBtn.addEventListener("click", () => openQuotesModal(book))
    const notesBtn = document.createElement("button");
    notesBtn.classList.add("notes-btn");
    notesBtn.textContent = "Notes";
    notesBtn.addEventListener("click", () => openNotesModal(book));
    
        // ── Delete ──
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete";
    
    deleteBtn.addEventListener("click", async () => {
        const confirmDelete = await showDeleteConfirm(book.title);
    
        if (!confirmDelete) return; // 🚫 user canceled
    
        try {
            await API.deleteBook(book.id);
    
            await getBooks();
            await getStats();
    
        } catch (err) {
            console.error("Delete failed:", err);
            TOAST.showToast("🍂 Could not delete the book.");
        }
        });
    buttonContainer.append(
        openBtn,
        tagBtn,
        quotesBtn,
        notesBtn,
        deleteBtn
        );
    return buttonContainer;
}