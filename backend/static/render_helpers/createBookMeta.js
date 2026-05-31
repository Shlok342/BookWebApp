export function createBookMeta(book) {
    const metaContainer = document.createElement("div");

    const titleRow = document.createElement("div");
    titleRow.classList.add("title-row");

    const title = document.createElement("h2");
    title.textContent = book.title;

    const tagsDiv = document.createElement("div");
    tagsDiv.classList.add("tags");

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
        streakBadge.textContent = '🌱 Nurtured for ${streakCount} days';
    } else {
        streakBadge.textContent = "Start your streak today";
        streakBadge.classList.add("streak-badge--cold");
    }

    metaContainer.append(
        titleRow,
        author,
        streakBadge
    );

    return metaContainer;
}