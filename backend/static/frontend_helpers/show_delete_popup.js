export function showDeleteConfirm(bookTitle) {
    return new Promise((resolve) => {
      // backdrop
      const overlay = document.createElement("div");
      overlay.className = "delete-confirm-overlay";
  
      // popup container
      const popup = document.createElement("div");
      popup.className = "delete-confirm-popup";
  
      popup.innerHTML = `
        <div class="delete-confirm-leaves">
          <span class="dc-leaf dc-leaf-1">🍂</span>
          <span class="dc-leaf dc-leaf-2">🌿</span>
          <span class="dc-leaf dc-leaf-3">🍃</span>
        </div>
        <div class="delete-confirm-icon">🥀</div>
        <h3 class="delete-confirm-title">Let this one go?</h3>
        <p class="delete-confirm-book">"${bookTitle}"</p>
        <p class="delete-confirm-msg">This book will be removed from your sanctuary.<br>This cannot be undone.</p>
        <div class="delete-confirm-actions">
          <button class="dc-cancel-btn">Keep it 🌱</button>
          <button class="dc-delete-btn">Remove 🍂</button>
        </div>
      `;
  
      overlay.appendChild(popup);
      document.body.appendChild(overlay);
  
      // force reflow then add visible class for animation
      overlay.offsetWidth;
      overlay.classList.add("dc-visible");
  
      const cleanup = (result) => {
        overlay.classList.remove("dc-visible");
        overlay.classList.add("dc-closing");
        setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 280);
      };
  
      popup.querySelector(".dc-cancel-btn").addEventListener("click", () => cleanup(false));
      popup.querySelector(".dc-delete-btn").addEventListener("click", () => cleanup(true));
  
      // clicking backdrop = cancel
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cleanup(false);
      });
  
      // ESC key = cancel
      const escHandler = (e) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", escHandler);
          cleanup(false);
        }
      };
      document.addEventListener("keydown", escHandler);
    });
  }