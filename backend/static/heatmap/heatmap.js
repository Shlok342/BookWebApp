import {API} from "../api_service/api.js";
function getTooltip() {
    return document.getElementById(
        "heatmap-tooltip"
    );
}
const CELL_SIZE = 12;
const GAP_SIZE = 3;
const COLUMN_WIDTH = CELL_SIZE + GAP_SIZE;
export async function initHeatmap() {
    try {
        const data = await API.getHeatmap();
        renderHeatmapStats(data.stats);
        renderHeatmap(data.days);
    } catch (err) {
        console.error("Failed to load heatmap", err);
    }
}
function renderHeatmap(days) {
    const container =
    document.getElementById(
        "heatmap-container"
    );

    if (!container) {
        console.warn(
            "Heatmap container not found"
        );
        return;
    }

    if (!days.length) {
        container.innerHTML =
            "<p>No reading activity yet.</p>";
        return;
    }
    console.log(days);
    console.log(document.getElementById("heatmap-container"));
    if (!container) {
        console.warn("Heatmap container not found");
        return;
    }
    container.innerHTML = "";

    const lookup = new Map();

    days.forEach(day => {
        lookup.set(
            day.day,
            day.total_pages
        );
    });
    const maxPages = Math.max(
        ...days.map(day => day.total_pages),
        1
    );
    const today = new Date();

    const startDate = new Date(today);

    startDate.setDate(today.getDate() - 364);
    renderMonthLabels(startDate);
    const startDay = startDate.getDay();

    for (let i = startDay; i > 0; i--) {
        const emptyCell = document.createElement("div");

        emptyCell.classList.add("heatmap-cell");
        emptyCell.classList.add("level-0");

        container.appendChild(emptyCell);
    }

    for (let i = 364; i >= 0; i--) {
        const current = new Date(today);
    
        current.setDate(today.getDate() - i);
    
        const dateString =
            `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    
        const pages =
            lookup.get(dateString) || 0;
    
        const cell = createCell(
            dateString,
            pages,
            maxPages
        );
        
        cell.dataset.month =
            current.getMonth();
        
        container.appendChild(cell);
    
        
    }
}
function renderMonthLabels(startDate) {
    const monthsContainer =
        document.getElementById("heatmap-months");

    monthsContainer.innerHTML = "";

    

    let previousMonth = -1;

    for (let i = 0; i <= 364; i++) {
        const current = new Date(startDate);

        current.setDate(startDate.getDate() + i);

        const month = current.getMonth();

        if (month !== previousMonth) {
            previousMonth = month;

            const weekIndex = Math.floor(i / 7);

            const label =
                document.createElement("div");

            label.classList.add("month-label");
            label.dataset.month =month;
    
            label.textContent =
                current.toLocaleString(
                    "default",
                    { month: "short" }
                );

            label.style.left =
                `${weekIndex * COLUMN_WIDTH}px`;

            monthsContainer.appendChild(label);
            label.addEventListener(
                "mouseenter",
                () => {
            
                    const cells =
                        document.querySelectorAll(
                            ".heatmap-cell"
                        );
            
                    cells.forEach(cell => {
            
                        if (
                            cell.dataset.month ===
                            String(month)
                        ) {
                            cell.classList.add(
                                "month-highlight"
                            );
                        }
                        else {
                            cell.classList.add(
                                "month-dim"
                            );
                        }
                    });
                }
            );
            
            label.addEventListener(
                "mouseleave",
                () => {
            
                    document
                        .querySelectorAll(
                            ".heatmap-cell"
                        )
                        .forEach(cell => {
            
                            cell.classList.remove(
                                "month-highlight"
                            );
            
                            cell.classList.remove(
                                "month-dim"
                            );
                        });
                }
            );
        }
    }
}
function renderHeatmapStats(stats) {

    const currentStreakElement =
        document.getElementById(
            "current-streak"
        );

    const longestStreakElement =
        document.getElementById(
            "longest-streak"
        );

    const activeDaysElement =
        document.getElementById(
            "active-days"
        );

    const pagesThisYearElement =
        document.getElementById(
            "pages-this-year"
        );

    currentStreakElement.textContent =
        `${stats.current_streak} days`;

    longestStreakElement.textContent =
        `${stats.longest_streak} days`;

    activeDaysElement.textContent =
        stats.active_days;

    pagesThisYearElement.textContent =
        stats.pages_this_year
            .toLocaleString();
}
function createCell(date, pages, maxPages) {
    const cell = document.createElement("div");

    cell.classList.add("heatmap-cell");

    cell.dataset.date = date;
    

    cell.addEventListener(
        "mouseenter",
        () => showTooltip(
            date,
            pages
        )
    );

    cell.addEventListener(
        "mousemove",
        (e) => {
    
            const tooltip = getTooltip();
    
            tooltip.style.left =
                `${e.clientX + 15}px`;
    
            tooltip.style.top =
                `${e.clientY + 15}px`;
        }
    );
    
    cell.addEventListener(
        "mouseleave",
        () => {
    
            const tooltip = getTooltip();
    
            tooltip.style.opacity = "0";
        }
    );
    

    cell.classList.add(getIntensityClass(pages,maxPages));

    return cell;
}
function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}
function getIntensityClass(
    pages,
    maxPages
) {

    if (pages === 0) {
        return "level-0";
    }

    const ratio =
        pages / maxPages;

    if (ratio <= 0.25) {
        return "level-1";
    }

    if (ratio <= 0.50) {
        return "level-2";
    }

    if (ratio <= 0.75) {
        return "level-3";
    }

    return "level-4";
}
function showTooltip(
    date,
    pages
) {
    const tooltip = getTooltip();
    const formattedDate =
        formatDate(date);

    tooltip.innerHTML =
        pages > 0
            ? `
                <strong>${pages} pages read</strong>
                <br>
                ${formattedDate}
              `
            : `
                <strong>No reading activity</strong>
                <br>
                ${formattedDate}
              `;

    tooltip.style.opacity = "1";
}
