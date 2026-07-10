import React from 'react';
import ReactDOM from 'react-dom/client';
import StatsModal from './StatsModal.jsx';

const container = document.getElementById("react-stats-modal");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<StatsModal />);
}
