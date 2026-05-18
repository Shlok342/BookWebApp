import sys

file_path = "c:\\Users\\sumee\\Book_web_code\\BookWebApp-1\\backend\\static\\style.css"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_media_queries = """
/* ── Stats Container (Moved out of media queries) ──────── */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin: 20px;
}

.stat-card {
  background: #ffffff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.stat-card h3 {
  font-size: 14px;
  color: #666;
}

.stat-card p {
  font-size: 22px;
  font-weight: bold;
  margin-top: 5px;
}

/* ═══════════════════════════════════════════════════════
   RESPONSIVE LAYOUTS — Modern Breakpoints
═══════════════════════════════════════════════════════ */

/* ── Large Tablets (≤ 1024px) ── */
@media (max-width: 1024px) {
  .topnav { padding: 16px 4vw; }
  .hero { padding: 26px 4vw 16px; }
  .sanctuary-panel { width: clamp(60%, 800px, 90%); }
  main { padding: 0 4vw 32px; }
  .books-container {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
  }
}

/* ── Tablets (≤ 768px) ── */
@media (max-width: 768px) {
  .topnav {
    padding: 14px 4vw;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
  .controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  .tagline-pill { font-size: 0.85rem; padding: 0.5rem 1rem; }
  .hero-title { font-size: clamp(2rem, 6vw, 2.8rem); margin-bottom: 0.8rem; }
  .hero-meta { flex-wrap: wrap; justify-content: center; gap: 0.6rem; margin-bottom: 1.2rem; }
  .hero-actions { justify-content: center; }
  .sanctuary-panel { width: 92%; border-radius: 1.2rem; }
  .books-container { 
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
    gap: 1.2rem; 
    padding-top: 1rem; 
  }
  .book-card { padding: 1.5rem; border-radius: 1.2rem; }
  .book-card h2 { font-size: clamp(1.1rem, 4vw, 1.25rem); margin-bottom: 1rem; }
  .pages-row .current-page { font-size: clamp(1.2rem, 5vw, 1.4rem); }
  .card-buttons { gap: 0.5rem; }
  
  /* Buttons adjustment */
  .open-btn, .quotes-btn, .notes-btn, .update-btn, .delete-btn, .tag-btn {
    font-size: 0.8rem;
    padding: 0.5rem 0.8rem;
    flex: 1 1 auto;
    text-align: center;
  }
  
  /* Modals */
  .modal-content, .quotes-modal-content, .notes-modal-content, #addBookModal .modal-content {
    width: 90vw;
    max-width: 500px;
    padding: 2rem 1.5rem;
    margin: 10vh auto;
    border-radius: 1.2rem;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  /* Background Elements */
  .leaf-3, .leaf-4, .leaf-6 { display: none; }
  .leaf-1 { font-size: 1.6rem; top: 5%; right: 5%; }
  .leaf-2 { font-size: 1.2rem; top: 15%; right: 10%; }
  .leaf-5 { font-size: 1.2rem; top: 10%; left: 5%; }
  .corner-plant { font-size: 2rem; opacity: 0.25; }
  .mountain-bg { height: 30vh; }
  footer { padding: 2rem 4vw; }
  .footer-quote { font-size: 0.9rem; }
}

/* ── Phones (≤ 600px) ── */
@media (max-width: 600px) {
  .topnav { flex-direction: column; gap: 1rem; }
  .controls { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .controls select { width: 100%; }
  .mood-ring-btn { width: 100%; grid-column: 1 / -1; }
  .books-container { grid-template-columns: 1fr; }
  .book-card { padding: 1.2rem; }
  .card-buttons { flex-direction: column; align-items: stretch; }
  .open-btn, .quotes-btn, .notes-btn, .update-btn, .delete-btn, .tag-btn { width: 100%; }
  
  /* Modals */
  .modal-content, .quotes-modal-content, .notes-modal-content, #addBookModal .modal-content {
    width: 95vw;
    max-width: none;
    margin: 5vh auto;
    padding: 1.5rem 1.2rem;
    max-height: 90vh;
  }
  .title-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .tags { max-width: 100%; }
  #tagsContainer { grid-template-columns: 1fr; }
}

/* ── Small Phones (≤ 480px) ── */
@media (max-width: 480px) {
  .hero-title { font-size: clamp(1.5rem, 8vw, 2rem); }
  .hero-meta { flex-direction: column; gap: 0.4rem; align-items: center; }
  .mini-stat { padding: 0.6rem 1rem; font-size: 0.95rem; }
  .add-btn { width: 100%; justify-content: center; padding: 0.8rem; font-size: 0.9rem; }
  .brand-sans, .brand-serif { font-size: 1.1rem; }
  .hero-actions { width: 100%; flex-direction: column; }
  .hero-actions > * { width: 100%; text-align: center; }
  .sanctuary-panel { width: 100%; border-radius: 0; border-left: none; border-right: none; }
  
  /* Mobile adjustments for delete popup */
  .delete-confirm-popup {
    width: 92vw;
    padding: 26px 20px 22px;
  }

  .delete-confirm-title {
    font-size: 1.3rem;
  }

  .delete-confirm-actions {
    flex-direction: column;
    gap: 8px;
  }
}

/* ── Very Small Phones (≤ 360px) ── */
@media (max-width: 360px) {
  .topnav { padding: 1rem 2vw; }
  .controls { grid-template-columns: 1fr; }
  .book-card { padding: 1rem; }
  .book-card h2 { font-size: 1rem; }
  .pages-row .current-page { font-size: 1.1rem; }
  .card-buttons { gap: 0.4rem; }
  .modal-content { padding: 1.2rem 0.8rem; }
}
"""

new_lines = []
skip = False
for i, line in enumerate(lines):
    # lines 2105 to 2355 correspond to index 2104 to 2354
    if i >= 2104 and i <= 2354:
        if i == 2104:
            new_lines.append(new_media_queries)
        continue
    # lines 2601 to 2616 correspond to index 2600 to 2615
    if i >= 2600 and i <= 2615:
        continue
    new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Replacement complete.")
