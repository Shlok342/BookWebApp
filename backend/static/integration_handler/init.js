
import { getChallenges } from "../modal_helper/challengeModal.js";
import { getBooks } from "../modal_helper/getBooks.js";
import {initQuotesModal} from "../modal_helper/quotesModal.js";
import {initNotesModal} from "../modal_helper/notesModal.js";
import { initThemeToggle,} from "../theme.js";
import { scheduleMidnightCheck, getGlobalStreak } from "../streak_helper/streak_helper.js";
import { loadAndDisplayQuote } from "../frontend_helpers/quote_of_the_day.js";
import { Auth } from "../auth/auth.js";
export function initMain(){

    initThemeToggle();
    initQuotesModal();
    initNotesModal();

    if (!Auth.isLoggedIn()) {
        return;
    }

    loadAndDisplayQuote();
    getBooks();
    getChallenges();
    getStats();

    getGlobalStreak();
    scheduleMidnightCheck();

    setInterval(async () => {
        await getGlobalStreak();
    }, 60000);
}