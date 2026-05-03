// api.js

export const API = {
    // ─── BOOKS ─────────────────────────────────────────
    async getBooks() {
      const res = await fetch("/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  
    async addBook(data) {
      const res = await fetch("/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to add book");
      return res.json();
    },
  
    async updateProgress(id, current_page) {
      const res = await fetch(`/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_page })
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
  
    async deleteBook(id) {
      const res = await fetch(`/books/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete book");
      return res.json();
    },
  
    async updateQuotes(id, quotes) {
      const res = await fetch(`/books/${id}/quotes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotes })
      });
      if (!res.ok) throw new Error("Failed to update quotes");
      return res.json();
    },
  
    async updateNotes(id, notes) {
      const res = await fetch(`/books/${id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes })
      });
      if (!res.ok) throw new Error("Failed to update notes");
      return res.json();
    },
  
    // ─── STATS ─────────────────────────────────────────
    async getStats() {
      const res = await fetch("/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  
    // ─── GLOBAL STREAK ─────────────────────────────────
    async getGlobalStreak() {
      const res = await fetch("/streak");
      if (!res.ok) throw new Error("Failed to fetch streak");
      return res.json();
    },
  
    // ─── CHALLENGES ────────────────────────────────────
    async getChallenges() {
      const res = await fetch("/challenges");
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return res.json();
    },
  
    // ─── QUOTE OF THE DAY ─────────────────────────────
    async getQuote() {
      const res = await fetch("/quote");
      if (!res.ok) throw new Error("Failed to fetch quote");
      return res.json();
    }
  };