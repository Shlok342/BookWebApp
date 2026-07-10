//Use a relative path to reference your existing api file outside the Vite folder
import React, { useState, useEffect } from 'react';
 
// Step up out of react_src, then go down into js/api_service
import { API } from '../api_service/api.js'; 
 
export default function StatsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
 
  // ─── HOOK INTO EXISTING NAVBAR BUTTON ────────────────────────
  useEffect(() => {
    const openBtn = document.getElementById("openStats");
    
    const handleOpen = () => {
      setIsOpen(true);
      fetchStats(); // Fetch fresh data every time the modal opens
    };
 
    if (openBtn) {
      openBtn.addEventListener("click", handleOpen);
    }
 
    // Cleanup listener if component unmounts
    return () => {
      if (openBtn) openBtn.removeEventListener("click", handleOpen);
    };
  }, []);
 
  // ─── FETCH DATA FROM FASTAPI ─────────────────────────────────
  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await API.getStats();
      setStats(data);
      
      // Update the "mini" stats that live elsewhere on the page
      updateMiniStats(data);
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setLoading(false);
    }
  };
 
  // Helper to update elements outside of this React component
  const updateMiniStats = (data) => {
    const miniBooks = document.getElementById("miniBooks");
    const miniPages = document.getElementById("miniPages");
    const miniMonth = document.getElementById("miniMonth");
 
    if (miniBooks) miniBooks.textContent = data.total_books;
    if (miniPages) miniPages.textContent = data.total_pages_read;
    if (miniMonth) miniMonth.textContent = data.pages_this_month;
  };
 
  // ─── CLOSE MODAL HANDLERS ────────────────────────────────────
  const closeModal = () => setIsOpen(false);
 
  const handleOutsideClick = (e) => {
    // If the user clicks the dark overlay wrapper itself, close it
    if (e.target.id === "statsModal") {
      closeModal();
    }
  };
 
  // If the modal state is false, render absolutely nothing
  if (!isOpen) return null;
 
  return (
    <div 
      className="stats-modal" 
      id="statsModal" 
      style={{ display: "flex" }} 
      onClick={handleOutsideClick}
    >
      <div className="stats-modal-content">
        <span className="stats-close" id="closeStats" onClick={closeModal}>
          &times;
        </span>
        <h2>Reading Insights</h2>
  
        {loading && !stats ? (
          <p>Loading your insights...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Books</h3>
              <p>{stats?.total_books ?? 0}</p>
            </div>
          
            <div className="stat-card">
              <h3>Total Pages</h3>
              <p>{stats?.total_pages_read ?? 0}</p>
            </div>
          
            <div className="stat-card">
              <h3>This Month</h3>
              <p>{stats?.pages_this_month ?? 0}</p>
            </div>
          
            <div className="stat-card">
              <h3>Avg / Month</h3>
              <p>{stats?.avg_pages_per_month ?? 0}</p>
            </div>
          
            {/* 🔥 NEW STREAK STATS */}
          
            <div className="stat-card">
              <h3>🔥 Streak Pages</h3>
              <p>{stats?.streak_pages_read ?? 0}</p>
            </div>
          
            <div className="stat-card">
              <h3>❄️ Streak This Month</h3>
              <p>{stats?.streak_pages_this_month ?? 0}</p>
            </div>
          
            <div className="stat-card">
              <h3>📊 Streak Avg</h3>
              <p>{stats?.avg_streak_pages_per_month ?? 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 