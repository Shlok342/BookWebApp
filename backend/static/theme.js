export async function applyThemeFromCover(book, modal) {
  if (!modal || typeof Vibrant === "undefined") return;

  try {
    if (!book.cover_url?.trim()) throw new Error("No cover");

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = book.cover_url;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const palette = await Vibrant.from(img).getPalette();

    const vibrant =
      palette.Vibrant?.hex ||
      palette.LightVibrant?.hex ||
      "#ffcc00";

    const dark =
      palette.DarkVibrant?.hex ||
      palette.DarkMuted?.hex ||
      vibrant;

    const light =
      palette.LightVibrant?.hex ||
      palette.LightMuted?.hex ||
      "#ffffff";

    const muted =
      palette.Muted?.hex ||
      vibrant;

    console.log(book.title, {
      vibrant,
      dark,
      light,
      muted
    });
    console.log(book.title, palette);

    // Cover colour dominates now
    modal.style.background = `
      radial-gradient(
        circle at top left,
        color-mix(in srgb, ${vibrant} 85%, white),
        color-mix(in srgb, ${dark} 80%, black)
      )
    `;

    modal.style.border = `
      2px solid ${light}
    `;

    modal.style.boxShadow = `
      0 20px 50px -10px
      color-mix(in srgb, ${vibrant} 70%, transparent)
    `;

    modal.style.color = "#ffffff";

    modal.querySelectorAll("h1,h2,h3,h4").forEach(h => {
      h.style.color = light;
      h.style.textShadow = `
        0 0 12px
        color-mix(in srgb, ${light} 40%, transparent)
      `;
    });

    modal.querySelectorAll("button").forEach(btn => {
      btn.style.background = vibrant;
      btn.style.color = "#ffffff";
      btn.style.border = `1px solid ${light}`;
      btn.style.fontWeight = "600";

      btn.style.boxShadow = `
        0 8px 20px
        color-mix(in srgb, ${vibrant} 60%, transparent)
      `;
    });

  } catch (err) {
    console.warn("Theme failed:", err);
    
    modal.style.background =
      "linear-gradient(135deg, #1f2937, #111827)";

    modal.style.border =
      "1px solid #374151";

    modal.style.color =
      "#ffffff";

    modal.querySelectorAll("h1,h2,h3,h4").forEach(h => {
      h.style.color = "";
      h.style.textShadow = "";
    });

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