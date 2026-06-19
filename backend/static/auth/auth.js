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
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || `Registration failed (${res.status})`);
    }

    const { access_token } = await res.json();
    Auth.setToken(access_token);
},

  logout() {
    Auth.clearToken();
    window.location.reload();
  }
};
// ─── GLOBAL 401 INTERCEPTOR ─────────────────────────────
const _fetch = window.fetch;
window.fetch = async (...args) => {
  const res = await _fetch(...args);
  const url = args[0]?.toString() || "";
  if (res.status === 401 && !url.includes("/auth/login") && !url.includes("/auth/register")) {
    Auth.logout();
  }
  return res;
};