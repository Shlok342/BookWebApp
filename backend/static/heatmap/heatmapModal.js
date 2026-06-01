import { initHeatmap } from "../heatmap/heatmap.js";

const activityModal =
    document.getElementById("activityModal");

export async function openActivityModal() {
    activityModal.style.display = "block";

    await initHeatmap();
}

window.addEventListener("click", (event) => {
    if (event.target === activityModal) {
        activityModal.style.display = "none";
    }
});

document
    .getElementById("activityClose")
    .addEventListener("click", () => {
        activityModal.style.display = "none";
    });