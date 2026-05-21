import { getGlobalStreak } from '../main.js';
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