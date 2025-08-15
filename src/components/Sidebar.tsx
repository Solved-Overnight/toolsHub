import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Beaker, History, FileText, Home, LogOut, ChevronLeft, ChevronRight, Settings, Book, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { auth } from '../lib/firebaseConfig';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onCollapse }: SidebarProps) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Dyeing Calculator', icon: Beaker, path: '/dyeing-calculator' },
    { name: 'Proforma Invoice', icon: FileText, path: '/proforma-invoice' },
    { name: 'Manage Recipes', icon: Book, path: '/manage-recipes' },
    { name: 'Generate Reports', icon: Printer, path: '/generate-reports' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#1A3636] text-white flex flex-col transition-all duration-300 z-50
        ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Top Section - Logo/Title */}
      <div className="flex items-center justify-center h-20 border-b border-white/10">
        {isCollapsed ? (
          <span className="text-2xl font-bold text-white">
            T<span className="text-[#FF9900]">H</span>
          </span>
        ) : (
          <span className="text-2xl font-bold text-white">
            Textile<span className="bg-[#FF9900] text-white px-2 py-1 rounded-md ml-1">Hub</span>
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center rounded-md p-2 text-sm font-medium transition-colors
              ${location.pathname === item.path ? 'bg-[#FF9900] text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
          >
            <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Section - Logout and Collapse */}
      <div className="px-2 py-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white mb-2"
          onClick={handleLogout}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>

      {/* Collapse trigger */}
      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
        <motion.button
          onClick={() => onCollapse(!isCollapsed)}
          className="z-50 p-1.5 rounded-full bg-gray-700 text-white hover:bg-[#FF9900] focus:outline-none transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.button>
      </div>
    </div>
  );
}
