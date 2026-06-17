const TOKEN_KEY = "bibliotheca_token";

export const Auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),

  async login(email, password) {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const { access_token } = await res.json();
    Auth.setToken(access_token);
  },

  async register(email, password) {
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      console.log("STATUS:", res.status);
      console.log("BODY:", await res.text());
      const error = await res.json();
      throw new Error(error.detail || "Registration failed");
    }
  
    const { access_token } = await res.json();
    Auth.setToken(access_token);
  },

  logout() {
    Auth.clearToken();
    window.location.reload();
  }
};