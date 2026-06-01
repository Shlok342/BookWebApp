import {API} from "../api_service/api.js";

export async function initHeatmap() {
    try {
        const data = await API.getHeatmap();

        renderHeatmap(data.days);
    } catch (err) {
        console.error("Failed to load heatmap", err);
    }
}
function renderHeatmap(days) {
    const container = document.getElementById("heatmap-container");
    console.log(days);
    console.log(document.getElementById("heatmap-container"));
    if (!container) {
        console.warn("Heatmap container not found");
        return;
    }
    container.innerHTML = "";

    const lookup = {};

    days.forEach(day => {
        lookup[day.day] = day.total_pages;
    });

    const today = new Date();

    const startDate = new Date(today);

    startDate.setDate(today.getDate() - 364);

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
    
        const pages = lookup[dateString] || 0;
    
        const cell = createCell(dateString, pages);
    
        container.appendChild(cell);
    }
}
function createCell(date, pages) {
    const cell = document.createElement("div");

    cell.classList.add("heatmap-cell");

    cell.dataset.date = date;

    cell.title = `${date}: ${pages} pages`;

    cell.classList.add(getIntensityClass(pages));

    return cell;
}
function getIntensityClass(pages) {
    if (pages === 0) return "level-0";
    if (pages <= 10) return "level-1";
    if (pages <= 25) return "level-2";
    if (pages <= 50) return "level-3";

    return "level-4";
}
