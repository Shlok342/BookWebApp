export async function applyThemeFromCover(book, modal) {
  if (!modal) return;

  if (typeof Vibrant === "undefined") {
    console.error("Vibrant not loaded");
    return;
  }

  try {
    if (!book.cover_url?.trim()) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = book.cover_url;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Image load failed"));
    });

    const palette = await Vibrant.from(img).getPalette();

    const accent =
      palette.Vibrant?.hex ||
      palette.DarkVibrant?.hex ||
      palette.Muted?.hex ||
      palette.LightVibrant?.hex ||
      "#ffcc00";

    const textAccent =
      palette.LightVibrant?.hex ||
      "#ffffff";

    modal.style.background =
      `radial-gradient(circle at top left,
      color-mix(in srgb, ${accent} 15%, #1f1f22),
      #09090b)`;

    modal.style.border =
      `1px solid color-mix(in srgb, ${accent} 25%, transparent)`;

    modal.style.boxShadow =
      `0 15px 35px -10px color-mix(in srgb, ${accent} 30%, transparent),
       0 5px 15px rgba(0,0,0,0.5)`;

    modal.style.color = "#ffffff";

    modal.querySelectorAll("h1, h2, h3, h4").forEach(heading => {
      heading.style.color = textAccent;
    });

    modal.querySelectorAll("button").forEach(btn => {
      btn.style.background = accent;
      btn.style.color = "#000";
      btn.style.border = "none";
      btn.style.fontWeight = "bold";

      btn.style.boxShadow =
        `0 4px 15px -3px color-mix(in srgb, ${accent} 60%, transparent)`;
    });

  } catch (err) {
    console.warn("Theme failed, fallback used:", err);

    modal.style.background =
      "radial-gradient(circle at top left, #1f2937, #111827)";

    modal.style.border =
      "1px solid #374151";

    modal.style.color =
      "#ffffff";

    modal.style.boxShadow = "";

    modal.querySelectorAll("button").forEach(btn => {
      btn.style.background = "";
      btn.style.color = "";
      btn.style.border = "";
      btn.style.boxShadow = "";
    });
  }
}

export function clearTheme(modal) {
  if (!modal) return;

  modal.style.background = "";
  modal.style.border = "";
  modal.style.color = "";
  modal.style.boxShadow = "";

  modal.querySelectorAll("button").forEach(btn => {
    btn.style.background = "";
    btn.style.color = "";
    btn.style.border = "";
    btn.style.boxShadow = "";
  });

  modal.querySelectorAll("h1, h2, h3, h4").forEach(heading => {
    heading.style.color = "";
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