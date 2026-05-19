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
  
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
  
      const palette = await Vibrant.from(img).getPalette();
  
      const bg = palette.DarkVibrant?.hex || "#1e1e1e";
      const accent = palette.Vibrant?.hex || "#ffcc00";
      const text = palette.LightVibrant?.hex || "#ffffff";
  
      document.querySelectorAll(".modal-content").forEach(m => {
        m.style.background = `linear-gradient(135deg, ${bg}, ${accent})`;
        m.style.color = text;
  
        const btn = m.querySelector("button");
        if (btn) btn.style.background = accent;
      });
  
    } catch (err) {
      if (book.cover_url.startsWith("data:image")) {
        console.log("Base64 detected");
      }
      console.warn("Theme failed, fallback used:", err);
  
      // 🔥 fallback so modal STILL works
      document.querySelectorAll(".modal-content").forEach(m => {
        m.style.background = "linear-gradient(135deg, #2c3e50, #4ca1af)";
        m.style.color = "#fff";
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