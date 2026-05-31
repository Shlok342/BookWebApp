import { createBookMeta } from "./createBookMeta.js";
import { createProgressSection } from "./createProgressSection.js";
import { createCardButtons } from "./createCardButtons.js";

export function createBookCard(book) {
    const currentPage = Number(book.current_page) || 0;
    const totalPages = Number(book.total_pages) || 0;

    const progress =
        totalPages > 0
            ? (currentPage / totalPages) * 100
            : 0;

    const pct = Math.round(progress);

    const quoteCount = (book.quotes || []).length;

    const card = document.createElement("div");
    card.classList.add("book-card");

    if (book.cover_url) {
        const coverDiv = document.createElement("div");
        coverDiv.classList.add("book-cover");
        coverDiv.style.backgroundImage = `url(${book.cover_url})`;
        card.appendChild(coverDiv);
    }

    const metaSection =
        createBookMeta(book);

    const progressSection =
        createProgressSection(
            book,
            currentPage,
            totalPages
        );

    const pagesRow = document.createElement("div");
    pagesRow.classList.add("pages-row");
    pagesRow.innerHTML = `
        <span>
            <span class="current-page">${currentPage}</span>
            <span class="total-pages"> / ${totalPages} pages</span>
        </span>
        <span class="pct-badge">${pct}%</span>
    `;

    const buttonSection =
        createCardButtons(book);

    const quoteHint = document.createElement("p");
    quoteHint.classList.add("quote-count-hint");
    quoteHint.textContent =
        `${quoteCount} / 5 quotes saved`;

    card.append(
        metaSection,
        progressSection,
        pagesRow,
        buttonSection,
        quoteHint
    );

    return card;
}