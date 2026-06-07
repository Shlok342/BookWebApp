import { API } from "../api_service/api.js";
async function loadAndDisplayQuote() {
    const quoteElement = document.querySelector('.footer-quote');
    if (!quoteElement) return;
  
    try {
      // 1. Fetch data from backend while the default text is still visible
      const data = await API.getQuote();
      
      // 2. Format your string using the exact backend keys ('quote' and 'author')
      const formattedQuote = `“${data.quote}” — ${data.author}`;
      
      // 3. Start the fade-out animation
      quoteElement.classList.add('fade-out');
      
      // 4. Wait 400ms for the text to completely disappear before swapping content
      setTimeout(() => {
        quoteElement.textContent = formattedQuote;
        
        // 5. Fade it back into view with the new text
        quoteElement.classList.remove('fade-out');
      }, 400);
  
    } catch (error) {
      console.error("Backend quote failed, staying on fallback text:", error);
      // If the server goes down, your default HTML text simply stays visible!
    }
  }
  
  // Fire the function as soon as the page structure is ready
  document.addEventListener('DOMContentLoaded', loadAndDisplayQuote);