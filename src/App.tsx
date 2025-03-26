import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DyeingCalculator } from './pages/DyeingCalculator';
import { History } from './pages/History';
import { ProformaInvoice } from './pages/ProformaInvoice';
import { Sidebar } from './components/Sidebar';
import './styles/themes.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    document.body.className = `app-theme theme-${theme}`;
  }, [theme]);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <Router>
      <div className={`flex app-theme theme-${theme}`}>
        <Sidebar isCollapsed={isCollapsed} onCollapse={handleSidebarCollapse} />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dyeing-calculator" element={<DyeingCalculator />} />
            <Route path="/history" element={<History />} />
            <Route path="/proforma-invoice" element={<ProformaInvoice />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
