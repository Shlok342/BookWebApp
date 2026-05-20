import { clearTheme } from "./theme.js";
import { store } from "./store.js";
export function closeModal(modal) {
    if (!modal) return;
  
    clearTheme();
  
    modal.style.display = "none";
  
    store.activeBookId = null;
  }