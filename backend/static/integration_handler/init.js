import { getStats } from "../modal_helper/statsModal.js";
import { getChallenges } from "../modal_helper/challengeModal.js";
import { getBooks } from "../modal_helper/getBooks.js";
import {initQuotesModal} from "../modal_helper/quotesModal.js";
import {initNotesModal} from "../modal_helper/notesModal.js";
import {initQuoteOfDayModal} from "../shows_message/quoteOfTheDayModal.js";
import { initThemeToggle,} from "../theme.js";
import { scheduleMidnightCheck, getGlobalStreak } from "./streak_helper/streak_helper.js";
export function initMain(){
    initThemeToggle();
    initQuoteOfDayModal();
    initQuotesModal();
// ─── NOTES MODAL ──────────────────────────────────────────────────────────────
    initNotesModal();
    getBooks();
    getChallenges();
    getStats();
    getGlobalStreak();
    scheduleMidnightCheck();
    setInterval(async () => {
        await getGlobalStreak();
    }, 60000);
}