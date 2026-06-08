async function getQuote() {
    const res = await fetch("/quote");
    if (!res.ok) throw new Error("Failed to fetch quote");
    return res.json();
  }
export async function loadAndDisplayQuote() {
    const quoteElement = document.querySelector('.footer-quote');
    if (!quoteElement) return;
  
    try {
      const data = await getQuote(); // Works perfectly as a standalone function now
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
  
  