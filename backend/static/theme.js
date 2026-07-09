export async function applyThemeFromCover(book, modal) {
  if (!modal || typeof Vibrant === "undefined") return;

  try {
    if (!book.cover_url?.trim()) {
      throw new Error("No cover URL");
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = book.cover_url;
    });

    const palette = await Vibrant.from(img).getPalette();

    const accent =
      palette.Vibrant?.hex ||
      palette.LightVibrant?.hex ||
      palette.Muted?.hex ||
      "#7c3aed";

    const secondary =
      palette.Muted?.hex ||
      palette.DarkMuted?.hex ||
      accent;

    const highlight =
      palette.LightVibrant?.hex ||
      palette.LightMuted?.hex ||
      "#f8fafc";

    const depth =
      palette.DarkMuted?.hex ||
      palette.DarkVibrant?.hex ||
      "#111827";

    console.log(`🎨 Theme palette for "${book.title}"`);
    console.log({
      accent,
      secondary,
      highlight,
      depth
    });

    modal.style.background = `
      linear-gradient(
        135deg,
        color-mix(in srgb, ${depth} 75%, black),
        color-mix(in srgb, ${secondary} 35%, ${depth})
      )
    `;

    modal.style.border = `
      1px solid
      color-mix(in srgb, ${highlight} 35%, transparent)
    `;

    modal.style.boxShadow = `
      0 24px 60px -12px
      color-mix(in srgb, ${accent} 25%, transparent)
    `;

    modal.style.color = "#ffffff";

    modal.querySelectorAll(
      "h1,h2,h3,h4,h5,h6"
    ).forEach(h => {
      h.style.color = highlight;
      h.style.textShadow = "none";
    });

    modal.querySelectorAll(
      "p,span,label,li,textarea,input"
    ).forEach(el => {
      el.style.color = "#ffffff";
    });

    modal.querySelectorAll("button").forEach(btn => {
      btn.style.background = accent;
      btn.style.color = "#ffffff";
      btn.style.border = `
        1px solid
        color-mix(in srgb, ${highlight} 30%, transparent)
      `;

      btn.style.boxShadow = `
        0 8px 24px
        color-mix(in srgb, ${accent} 30%, transparent)
      `;

      btn.style.fontWeight = "600";
    });

  } catch (err) {
    console.error(
      `❌ Theme generation failed for "${book.title}"`,
      err
    );

    modal.style.background =
      "linear-gradient(135deg, #1e293b, #0f172a)";

    modal.style.border =
      "1px solid rgba(255,255,255,0.1)";

    modal.style.color =
      "#ffffff";

    modal.querySelectorAll(
      "h1,h2,h3,h4,h5,h6"
    ).forEach(h => {
      h.style.color = "#ffffff";
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
  const toggleBtn = document.getElementById("dark-mode-toggle");
  if (!toggleBtn) return;

  const root = document.documentElement;

  const isDark = localStorage.getItem("theme") === "dark";
  root.classList.toggle("dark-theme", isDark);

  toggleBtn.textContent = isDark
      ? "☀️ My eyes! Go back!"
      : "🌙 Go Dark!";

     toggleBtn.addEventListener("click", () => {
      console.log("=== THEME TOGGLE CLICKED ===");
    
        console.log("Before:", document.documentElement.className);
    
        document.documentElement.classList.toggle("dark-theme");
    
        console.log("After:", document.documentElement.className);
    
        console.log(
            "--forest =",
            getComputedStyle(document.documentElement)
                .getPropertyValue("--forest")
                .trim()
        );
    
        const dark = document.documentElement.classList.contains("dark-theme");
    
        localStorage.setItem("theme", dark ? "dark" : "light");
    
        toggleBtn.textContent = dark
            ? "☀️ My eyes! Go back!"
            : "🌙 Go Dark!";
    });
}

export function getProgressColor(pct) {
  const hue = (pct / 100) * 270;
  return `hsl(${hue}, 80%, 50%)`;
}