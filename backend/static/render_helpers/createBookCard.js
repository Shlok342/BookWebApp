import { API } from "../api_service/api.js";
import { store } from "../store.js";
import { TOAST } from '../shows_message/toast.js';
import {getProgressColor } from "../theme.js";
import { openNotesModal} from "../modal_helper/notesModal.js";
import { openBookModal} from "../integration_handler/open_book.js";
import { openQuotesModal} from "../modal_helper/quotesModal.js";
import { showDeleteConfirm } from "../frontend_helpers/show_delete_popup.js";
export function createBookCard(book){
    
        const currentPage = Number(book.current_page) || 0;
        const totalPages = Number(book.total_pages) || 0;
        const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
        const quoteCount = (book.quotes || []).length;
        const pct = isNaN(progress) ? 0 : Math.round(progress);
    
        const card = document.createElement("div");
        card.classList.add("book-card");
    
        // 🖼️ BOOK COVER
        if (book.cover_url) {
          const coverDiv = document.createElement("div");
          coverDiv.classList.add("book-cover");
          coverDiv.style.backgroundImage = `url(${book.cover_url})`;
          card.appendChild(coverDiv);
        }
    
        const titleRow = document.createElement("div");
        titleRow.classList.add("title-row");
    
        const title = document.createElement("h2");
        title.textContent = book.title;
    
        // tags container
        const tagsDiv = document.createElement("div");
        tagsDiv.classList.add("tags");
    
        // render tags
        (book.tags || []).forEach(tag => {
          const tagEl = document.createElement("span");
          tagEl.classList.add("tag");
          tagEl.textContent = tag;
          tagsDiv.appendChild(tagEl);
        });
    
        titleRow.appendChild(title);
        titleRow.appendChild(tagsDiv);
    
        const author = document.createElement("p");
        author.classList.add("book-author");
        author.textContent = book.author ? `by ${book.author}` : "";
    
        const streakBadge = document.createElement("div");
        streakBadge.classList.add("streak-badge");
        const streakCount = book.streak_count ?? 0;
        if (streakCount > 0) {
          streakBadge.textContent = `🔥 ${streakCount}-days for this Book!`;
        } else {
          streakBadge.textContent = "Start your streak today";
          streakBadge.classList.add("streak-badge--cold");
        }
    
        const progressLabel = document.createElement("p");
        progressLabel.classList.add("reading-progress-label");
        progressLabel.textContent = "READING PROGRESS";
    
        const pagesRow = document.createElement("div");
        pagesRow.classList.add("pages-row");
        pagesRow.innerHTML = `
          <span>
            <span class="current-page">${currentPage}</span>
            <span class="total-pages"> / ${totalPages} pages</span>
          </span>
          <span class="pct-badge">${pct}%</span>
        `;
    
        const progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");
    
        const progressFill = document.createElement("div");
        progressFill.classList.add("progress");
        progressFill.style.width = "0%";
        progressFill.style.backgroundColor = getProgressColor(0);
        progressBar.appendChild(progressFill);
    
        progressFill.offsetWidth; // force reflow
        requestAnimationFrame(() => {
          progressFill.style.width = `${progress}%`;
          progressFill.style.backgroundColor = getProgressColor(pct);
        });
    
        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("card-buttons");
    
        // ── Open ──
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
          tagsModal.style.display = "block";
        });
        // ── Quotes ──
        const quotesBtn = document.createElement("button");
        quotesBtn.classList.add("quotes-btn");
        quotesBtn.textContent = "Quotes";
        quotesBtn.addEventListener("click", () => openQuotesModal(book));
    
        // ── Update Progress ──
        const updateBtn = document.createElement("button");
        updateBtn.classList.add("update-btn");
        updateBtn.innerHTML = '<span class="btn-label">Update Progress</span>';
    
        updateBtn.addEventListener("click", () => {
          showProgressInput(book, currentPage, totalPages);
        });
    
        // ── Notes ──
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
    
        buttonsDiv.append(openBtn,tagBtn, quotesBtn, updateBtn, notesBtn, deleteBtn);
    
        const quoteHint = document.createElement("p");
        quoteHint.classList.add("quote-count-hint");
        quoteHint.textContent = `${quoteCount} / 5 quotes saved`;
    
        card.append(titleRow, author, streakBadge, progressLabel, pagesRow, progressBar, buttonsDiv, quoteHint);
        return card;
      
}