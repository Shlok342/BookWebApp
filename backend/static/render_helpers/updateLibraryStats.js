export function updateLibraryStats(filteredBooks){
    const bloomedCount = filteredBooks.filter(
        b => b.total_pages > 0 && b.current_page >= b.total_pages
      ).length;
      document.getElementById("bloomedCount").textContent = bloomedCount;
    
      const storiesEl = document.getElementById("storiesCount");
      if (storiesEl) {
        storiesEl.innerHTML = `<em>${filteredBooks.length} ${filteredBooks.length === 1 ? "story" : "stories"} collected</em>`;
      }
}