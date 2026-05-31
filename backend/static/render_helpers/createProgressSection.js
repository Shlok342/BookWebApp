import { getProgressColor } from "../theme.js";
import { showProgressInput} from "../streak_helper/progressPopup.js";

export function createProgressSection(book, currentPage, totalPages){
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
    const progressLabel = document.createElement("p");
    progressLabel.classList.add("reading-progress-label");
    progressLabel.textContent = "READING PROGRESS";
    const pct = isNaN(progress) ? 0 : Math.round(progress);
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");
    
    const progressFill = document.createElement("div");
    progressFill.classList.add("progress");
    progressFill.style.width = "0%";
    progressFill.style.backgroundColor = getProgressColor(0);
    progressBar.appendChild(progressFill);

    const updateBtn = document.createElement("button");
        updateBtn.classList.add("update-btn");
        updateBtn.innerHTML = '<span class="btn-label">Update Progress</span>';
    
        updateBtn.addEventListener("click", () => {
          showProgressInput(book, currentPage, totalPages);
        });
    
    progressFill.offsetWidth; // force reflow
    requestAnimationFrame(() => {
     progressFill.style.width = `${progress}%`;
     progressFill.style.backgroundColor = getProgressColor(pct);
        });
    const container = document.createElement("div");
    container.classList.add("book-progress-section");
    container.append(
    progressLabel,
    progressBar,
    updateBtn
    );
        
    return container;
}