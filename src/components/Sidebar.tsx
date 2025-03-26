import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Beaker, Calculator, Settings2, History, Home } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  onCollapse: (collapsed: boolean) => void;
  isCollapsed: boolean;
}

export function Sidebar({ onCollapse, isCollapsed }: SidebarProps) {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Beaker, label: 'Dyeing Calculator', path: '/dyeing-calculator' },
    { icon: Calculator, label: 'Recipe Management', path: '/recipes' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Settings2, label: 'Settings', path: '/settings' },
  ];

  const handleMouseEnter = () => {
    if (isCollapsed) {
      onCollapse(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isCollapsed) {
      onCollapse(true);
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "h-screen bg-secondary border-r border-border fixed left-0 top-0 transition-all duration-300 text-secondary-foreground z-50 whitespace-nowrap",
        isCollapsed ? "w-16" : "w-64",
        "hover:w-64"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-center p-4">
        <div className={cn("flex items-center space-x-2", isCollapsed && "justify-center")}>
          <Beaker className="h-8 w-8 text-accent-primary" />
          {!isCollapsed && <span className="text-xl font-semibold">Solved Overnight</span>}
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-4 py-3 hover:bg-accent-secondary/10 transition-colors text-secondary-foreground",
              location.pathname === item.path && "bg-accent-primary/10 text-accent-primary font-semibold",
              isCollapsed && "justify-center",
            )}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2 truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
