import { Auth } from "./auth.js";
import { initMain } from "../integration_handler/init.js";

const modal = document.getElementById("authModal");
// Target the new form element
const authForm = document.getElementById("authForm"); 
const emailInput = document.getElementById("authEmail");
const passwordInput = document.getElementById("authPassword");
const submitBtn = document.getElementById("authSubmit");
const toggleBtn = document.getElementById("authToggle");
const errorEl = document.getElementById("authError");

let mode = "login"; 

toggleBtn.addEventListener("click", () => {
  mode = mode === "login" ? "register" : "login";
  submitBtn.textContent = mode === "login" ? "Login" : "Register";
  toggleBtn.textContent = mode === "login"
    ? "No account? Register"
    : "Have an account? Login";
  errorEl.textContent = "";
});

// Changed from submitBtn click to authForm submit
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  errorEl.textContent = "";
  
  try {
    if (mode === "login") {
      await Auth.login(email, password);
    } else {
      await Auth.register(email, password);
    }
    modal.style.display = "none";
    
    // Fix: Clear the layout state so books aren't covered up
    const guestState = document.getElementById("guestState");
    if (guestState) guestState.style.display = "none";
    const bookshelf = document.getElementById("bookshelf");
    if (bookshelf) bookshelf.style.display = "block";

    initMain();
  } catch (e) {
    errorEl.textContent = e.message;
  }
});


export function initAuth() {
  if (!Auth.isLoggedIn()) {
    modal.style.display = "flex";
  } else {
    modal.style.display = "none";
  }
}
