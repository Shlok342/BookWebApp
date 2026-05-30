export async function applyThemeFromCover(book) {
  if (typeof Vibrant === "undefined") {
    console.error("Vibrant STILL not loaded");
    return;
  }

  try {
    if (!book.cover_url || !book.cover_url.trim()) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = book.cover_url;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
    });

    const palette = await Vibrant.from(img).getPalette();

    // 1. Smarter Fallbacks for the Palette
    const accent =
    palette.Vibrant?.hex ||
    palette.DarkVibrant?.hex ||
    palette.Muted?.hex ||
    palette.LightVibrant?.hex ||
    "#ffcc00";
    const textAccent = palette.LightVibrant?.hex || "#ffffff";

    document.querySelectorAll(".modal-content").forEach(m => {
      // 2. THE FIX: The Premium Gradient
      // Instead of blasting the modal with the pure accent color, 
      // we blend 15% of the accent color into a deep dark gray/black.
      // This creates a rich, tinted "dark mode" effect that never gets overwhelming.
      m.style.background = `radial-gradient(circle at top left, color-mix(in srgb, ${accent} 15%, #1f1f22), #09090b)`;
      
      // 3. Premium Touches: Subtle Borders and Glows
      m.style.border = `1px solid color-mix(in srgb, ${accent} 25%, transparent)`;
      m.style.boxShadow = `0 15px 35px -10px color-mix(in srgb, ${accent} 30%, transparent), 0 5px 15px rgba(0,0,0,0.5)`;
      
      // 4. Readability
      m.style.color = "#ffffff"; // Force white body text for contrast against the dark background

      // Optional: If you have a title/heading, tint it with the LightVibrant color
      m.querySelectorAll("h1, h2, h3, h4").forEach(heading => {
        heading.style.color = textAccent;
      });
      // 5. Gorgeous Button Styling
      m.querySelectorAll("button").forEach(btn => {
        btn.style.background = accent;
        btn.style.color = "#000";
        btn.style.border = "none";
        btn.style.fontWeight = "bold";
      
        btn.style.boxShadow =
          `0 4px 15px -3px color-mix(in srgb, ${accent} 60%, transparent)`;
      });
    });

  } catch (err) {
    if (book.cover_url?.startsWith("data:image")) {
      console.log("Base64 detected");
    }
    console.warn("Theme failed, fallback used:", err);

    // 🔥 Premium Fallback so it still looks good
    document.querySelectorAll(".modal-content").forEach(m => {
      m.style.background = "radial-gradient(circle at top left, #1f2937, #111827)";
      m.style.border = "1px solid #374151";
      m.style.color = "#ffffff";
    });
    m.querySelectorAll("button").forEach(btn => {
      btn.style.background = "";
      btn.style.color = "";
      btn.style.border = "";
      btn.style.boxShadow = "";
    });

  }
}
export function clearTheme() {
    document.querySelectorAll(".modal-content").forEach(m => {
      m.style.background = "";
      m.style.color = "";
  
      const btn = m.querySelector("button");
      if (btn) btn.style.background = "";
    });
}
export function initThemeToggle() {
  const toggleBtn = document.getElementById('dark-mode-toggle');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    toggleBtn.textContent =
      document.body.classList.contains('dark-theme')
        ? '☀️ My eyes! Go back!'
        : '🌙 Go Dark!';
  });
}
export function getProgressColor(pct) {
  const hue = (pct / 100) * 270;
  return `hsl(${hue}, 80%, 50%)`;
}