// ─── TAG COLORS ─────────────────────────────────────────────────────────────
const chipColors = [
    "#dfccfb",
    "#c4e4c5",
    "#b3c5ff",
    "#fdedb3",
    "#ffbfa3",
    "#bffee9",
    "#e8bcf0",
    "#e1c7a5",
    "#f3da90",
    "#a3b0cc",
    "#c3ebf7",
    "#fca5a5"
  ];
const AVAILABLE_TAGS = ["⋆˙⟡ Witty", 
    "𓆩❤︎𓆪 Romantic",
    "˙◠˙ Total Sobfest",
    "•ᴗ• Pure Joy",
    ">ᴗ< Page Turner",
    "♬ Vibe Check",
    "𖡎 Brain Melt",
    "☕︎ Slow Burn",
    "♛ Instant Classic",
    "ཐི༏ཋྀ Deep Dark",
    "⚡︎⚡︎ Easy Breezy",
    "✌︎㋡ Chef's Kiss"];
import {store} from "../store.js"
import { TOAST } from "../shows_message/toast.js";
import {API} from "../api_service/api.js"
import { getBooks } from "./getBooks.js";
import { closeModal } from "../close.js";
const tagsModal = document.getElementById("tagsModal");
  // ─── RENDER TAG OPTIONS ─────────────────────────────────────────────────────
  export function renderTagOptions(){
  
    const container = document.getElementById("tagsContainer");
  
    container.innerHTML = "";
  
    AVAILABLE_TAGS.forEach((tag, index) => {
  
      const chip = document.createElement("span");
  
      chip.classList.add("tag-chip");
  
      const assignedColor = chipColors[index % chipColors.length];
  
      chip.style.setProperty("--custom-color", assignedColor);
  
      if (store.selectedTags.includes(tag)) {
        chip.classList.add("active");
      }
  
      chip.textContent = tag;
  
      chip.addEventListener("click", () => {
  
        if (store.selectedTags.includes(tag)) {
  
          store.selectedTags =
            store.selectedTags.filter(t => t !== tag);
  
        } else {
  
          if (store.selectedTags.length >= 3) {
            TOAST.showToast("You can only select up to 3 tags.");
            return;
          }
  
          store.selectedTags.push(tag);
        }
        renderTagOptions();
        
      });
  
      container.appendChild(chip);
    });
  
    // ─── SAVE TAGS ────────────────────────────────────────────────────────────
    document.getElementById("saveTagsBtn").onclick = async () => {
  
      if (!store.activeBookId) return;
  
      try {
  
        await API.updateTags(
          store.activeBookId,
          store.selectedTags
        );
  
        closeModal(tagsModal);
  
        await getBooks();
  
      } catch (err) {
  
        console.error("Failed to save tags:", err);
  
      }
    };
  
    // ─── CLOSE MODAL ──────────────────────────────────────────────────────────
    document.getElementById("tagsClose").onclick = () => {
  
      tagsModal.style.display = "none";
  
      store.activeBookId = null;
  
    };
  }