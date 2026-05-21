
import {API} from "../api_service/api.js";
import { store } from "../store.js";
let streakTimer = null;
export function scheduleMidnightCheck() {
    function scheduleNext() {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);
  
      const delay = Math.max(0, nextMidnight - now);
  
      setTimeout(async () => {
        try {
          console.log("🌙 Midnight hit — updating streak");
          await getGlobalStreak();
        } finally {
          scheduleNext();
        }
      }, delay);
    }
  
    scheduleNext();
  }
  export async function getGlobalStreak() {
  try {
      const data = await API.getGlobalStreak();
      // #region agent log
      fetch("http://127.0.0.1:7490/ingest/dc227871-b4dc-4521-8755-f48980c0dcae", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f3a808" },
        body: JSON.stringify({
          sessionId: "f3a808",
          location: "script.js:getGlobalStreak",
          message: "GET /streak response",
          data: {
            streak_count: data.streak_count,
            last_read_date: data.last_read_date,
            freeze_count: data.freeze_count,
          },
          hypothesisId: "H_streak_ui",
          timestamp: Date.now(),
        }),
      }).catch(() => { });
      // #endregion
      renderGlobalStreak(data.streak_count, data.last_read_date, data.freeze_count);
    }catch (err) {
      console.error("Failed to fetch global streak:", err);
    }
  }
  //FUNCTION GLOBAL STREAK WARNING:
  function renderGlobalStreak(count, lastReadDate, freezeCount) {
    const el = document.getElementById("globalStreak");
    if (!el) return;
  
    const setCold = (msg) => {
      el.textContent = msg;
      el.classList.add("global-streak-badge--cold");
      el.classList.remove("global-streak-warning");
    };
  
    const setActive = (msg) => {
      el.textContent = msg;
      el.classList.remove("global-streak-badge--cold");
      el.classList.remove("global-streak-warning");
    };
  
    if (!lastReadDate) {
      setCold(count === 0 ? "💀 Your streak died. Start again!" : "Start your streak today!");
      return;
    }
  
    const today = new Date();
    const last = new Date(lastReadDate);
  
    today.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);
  
    const diffDays = (today - last) / (1000 * 60 * 60 * 24);
    store.lastKnownGlobalStreak = count;
    const usableFreezes = freezeCount || 0;
  
    // ── Read today ──
    if (diffDays === 0) {
      let msg = `🔥 ${count} day streak`;
      if (usableFreezes > 0) {
        msg += ` 🧊 ${usableFreezes} freeze${usableFreezes > 1 ? "s" : ""}`;
      }
      setActive(msg);
      return;
    }
  
    // ── Day 2 → freeze applies OR streak breaks ──
    if (diffDays === 2) {
      if (usableFreezes > 0) {
        el.textContent = `🧊 Freeze will be used if you don’t read today (${usableFreezes} left)`;
        el.classList.add("global-streak-warning");
        el.classList.remove("global-streak-badge--cold");
      } else {
        setCold("💀 Streak lost!");
      }
      return;
    }
  
    // ── Beyond recovery ──
    if (diffDays > 2) {
      setCold("💀 Streak lost!");
      return;
    }
  
    // ── Day 1 → warning (freeze irrelevant here) ──
    if (diffDays === 1) {
      updateTimeLeft(lastReadDate);
      clearInterval(streakTimer);

      streakTimer = setInterval(() => {
        updateTimeLeft(lastReadDate);
      }, 60000);
      el.classList.add("global-streak-warning");
      el.classList.remove("global-streak-badge--cold");
    }
  }
  
  function updateTimeLeft(lastReadDate) {
    const el = document.getElementById("globalStreak");
    if (!el) return;
  
    if (!lastReadDate) return;
  
    const now = new Date();
    const last = new Date(lastReadDate);
  
    now.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);
  
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
  
    // 👉 Only show timer if user has NOT read today
    if (diffDays >= 1) {
      const current = new Date();
  
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
  
      const msLeft = midnight - current;
  
      const hours = Math.floor(msLeft / (1000 * 60 * 60));
      const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  
      el.textContent = `⏳ ${hours}h ${minutes}m left to save your streak`;
    }
  }