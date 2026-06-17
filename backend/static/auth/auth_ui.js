import { Auth } from "./auth.js";
import { initMain } from "../integration_handler/init.js";

const modal = document.getElementById("authModal");
const emailInput = document.getElementById("authEmail");
const passwordInput = document.getElementById("authPassword");
const submitBtn = document.getElementById("authSubmit");
const toggleBtn = document.getElementById("authToggle");
const errorEl = document.getElementById("authError");

let mode = "login"; // or "register"

toggleBtn.addEventListener("click", () => {
  mode = mode === "login" ? "register" : "login";
  submitBtn.textContent = mode === "login" ? "Login" : "Register";
  toggleBtn.textContent = mode === "login"
    ? "No account? Register"
    : "Have an account? Login";
  errorEl.textContent = "";
});

submitBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  errorEl.textContent = "";
  try {
    if (mode === "login") await Auth.login(email, password);
    else await Auth.register(email, password);
    modal.style.display = "none";
    
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