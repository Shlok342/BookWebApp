import { API } from "../api_service/api.js";
async function loadAndDisplayQuote() {
    const quoteElement = document.querySelector('.footer-quote');
    if (!quoteElement) return;
  
    try {
      const data = await API.getQuote(); // Works perfectly as a standalone function now
      const formattedQuote = `“${data.quote}” — ${data.author}`;
      
      quoteElement.classList.add('fade-out');
      
      setTimeout(() => {
        quoteElement.textContent = formattedQuote;
        quoteElement.classList.remove('fade-out');
      }, 400);
  
    } catch (error) {
      console.error("Failed to load backend quote:", error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadAndDisplayQuote);