import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from './pages/LandingPage';
import { DyeingCalculator } from './pages/DyeingCalculator';
import { History } from './pages/History';
import { ProformaInvoice } from './pages/ProformaInvoice';
import { Settings } from './pages/Settings';
import { AuthPage } from './pages/AuthPage'; // Import the new AuthPage
import { Sidebar } from './components/Sidebar';
import { auth } from './lib/firebaseConfig'; // Import auth
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged

function App() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState<any>(null); // State to hold user object
  const [loading, setLoading] = useState(true); // State to manage loading of auth state
  const location = useLocation();

  useEffect(() => {
    // Load theme from localStorage and apply it
    const savedSettings = localStorage.getItem('userSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { theme: 'light' };
    document.body.className = `theme-${settings.theme}`;
    
    // Listen for storage changes to update theme across tabs
    const handleStorageChange = () => {
      const updatedSettings = localStorage.getItem('userSettings');
      const newSettings = updatedSettings ? JSON.parse(updatedSettings) : { theme: 'light' };
      document.body.className = `theme-${newSettings.theme}`;
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false once auth state is determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  if (loading) {
    // Optionally, render a loading spinner or placeholder
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {user && <Sidebar isCollapsed={isCollapsed} onCollapse={handleSidebarCollapse} />} {/* Only show sidebar if user is logged in */}
      <div className={`flex-1 transition-all duration-300 ${user ? (isCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {user ? (
              // Routes for authenticated users
              <>
                <Route path="/" element={<motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4"
                ><LandingPage /></motion.div>} />
                <Route path="/dyeing-calculator" element={<motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4"
                ><DyeingCalculator /></motion.div>} />
                <Route path="/history" element={<motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4"
                ><History /></motion.div>} />
                <Route path="/proforma-invoice" element={<motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4"
                ><ProformaInvoice /></motion.div>} />
                <Route path="/settings" element={<motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4"
                ><Settings /></motion.div>} />
                {/* Redirect any unknown paths to home if authenticated */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              // Routes for unauthenticated users
              <>
                <Route path="/auth" element={<AuthPage />} />
                {/* Redirect any path to auth if not authenticated */}
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            )}
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
