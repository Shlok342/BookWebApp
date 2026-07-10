import React from 'react';
import ReactDOM from 'react-dom/client';
import StatsModal from './StatsModal.js';

const container = document.getElementById("react-stats-modal");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<StatsModal />);
}
