export const TOAST = {
    showToast(message) { // Dropped the "function" keyword
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.cssText = `
          position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
          background:#333; color:white; padding:12px 20px; border-radius:8px;
          font-size:14px; z-index:9999; opacity:1; transition:opacity 0.5s;
        `;
        document.body.appendChild(toast);
        setTimeout(() => { 
            toast.style.opacity = "0"; 
            setTimeout(() => toast.remove(), 500); 
        }, 3000);
    }
};