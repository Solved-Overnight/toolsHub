import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from './pages/LandingPage';
import { DyeingCalculator } from './pages/DyeingCalculator';
import { ProformaInvoice } from './pages/ProformaInvoice';
import { Settings } from './pages/Settings';
import SocialPortal from './pages/SocialPortal';
import { AuthPage } from './pages/AuthPage';
import { InventoryManagement } from './pages/InventoryManagement';
import { Sidebar } from './components/Sidebar';
import { auth } from './lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ToastProvider } from './components/ui/ToastProvider'; // Import ToastProvider

function App() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { theme: 'light' };
    document.body.className = `theme-${settings.theme}`;
    
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <ToastProvider> {/* Wrap the entire application content with ToastProvider */}
      <div className="flex min-h-screen">
        <AnimatePresence mode="wait">
          {loading && (
            <LoadingSpinner key="loading-spinner" />
          )}
          {!loading && (
            <>
              {user && <Sidebar isCollapsed={isCollapsed} onCollapse={handleSidebarCollapse} />}
              <div className={`flex-1 transition-all duration-300 ${user ? (isCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}`}>
                <Routes location={location} key={location.pathname}>
                  {user ? (
                    <>
                      <Route path="/" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><LandingPage /></motion.div>} />
                      <Route path="/dyeing-calculator" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><DyeingCalculator user={user} /></motion.div>} />
                      <Route path="/proforma-invoice" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><ProformaInvoice user={user} /></motion.div>} />
                      <Route path="/inventory" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><InventoryManagement user={user} /></motion.div>} />
                      <Route path="/settings" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><Settings /></motion.div>} />
                      <Route path="/social-portal" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><SocialPortal /></motion.div>} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  ) : (
                    <>
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="*" element={<Navigate to="/auth" replace />} />
                    </>
                  )}
                </Routes>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ToastProvider>
  );
}

export default App;
