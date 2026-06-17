// api.js
import { Auth } from "../auth/auth.js";
export const API = {
    _headers(extra = {}) {
      const token = Auth.getToken();
      return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...extra
      };
    },
    // ─── BOOKS ─────────────────────────────────────────
    async getBooks() {
      const res = await fetch("/books",{ headers: API._headers() });
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  
    async addBook(data) {
      const res = await fetch("/books",{

        method: "POST",
        headers: API._headers(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to add book");
      return res.json();
    },
  
    async updateProgress(id, current_page) {
      const res = await fetch(`/books/${id}`, {
        method: "PATCH",
        headers: API._headers(),
        body: JSON.stringify({ current_page })
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
  
    async deleteBook(id) {
      const res = await fetch(`/books/${id}`, {
        method: "DELETE",
        headers: API._headers()
      });
      if (!res.ok) throw new Error("Failed to delete book");
      return res.json();
    },
  
    async updateQuotes(id, quotes) {
      const res = await fetch(`/books/${id}/quotes`, {
        method: "PATCH",
        headers: API._headers(),
        body: JSON.stringify({ quotes })
      });
      if (!res.ok) throw new Error("Failed to update quotes");
      return res.json();
    },
  
    async updateNotes(id, notes) {
      const res = await fetch(`/books/${id}/notes`, {
        method: "PATCH",
        headers: API._headers(),
        body: JSON.stringify({ notes })
      });
      if (!res.ok) throw new Error("Failed to update notes");
      return res.json();
    },
  
    async updateTags(bookId, tags) {
      const response = await fetch(`/books/${bookId}/tags`, {
        method: "PATCH",
        headers: API._headers(),
        body: JSON.stringify({ tags })
      });
    
      if (!response.ok) {
        throw new Error("Failed to update tags");
      }
    
      return response.json();
    },
    // ─── STATS ─────────────────────────────────────────
    async getStats() {
      const res = await fetch("/stats",{ headers: API._headers() });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },

    // ─── GLOBAL STREAK ─────────────────────────────────
    async getGlobalStreak() {
      const res = await fetch("/streak",{ headers: API._headers() });
      if (!res.ok) throw new Error("Failed to fetch streak");
      return res.json();
    },
  
    // ─── CHALLENGES ────────────────────────────────────
    async getChallenges() {
      const res = await fetch("/challenges",{ headers: API._headers() });
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return res.json();
    },
  
    
    
    async getHeatmap() {
      const res = await fetch("/heatmap",{ headers: API._headers() });
  
      if (!res.ok) {
          throw new Error("Failed to fetch heatmap");
      }
  
      return res.json();
    }
  };