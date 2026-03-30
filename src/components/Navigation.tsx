import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, BarChart2, Bell, Shield, Settings, BookOpen, HelpCircle, Activity, Cloud, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function TopNav() {
  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#0c0e11]/60 backdrop-blur-xl z-50 border-b border-outline-variant/10 shadow-lg">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold tracking-tighter text-primary font-headline">GOA CDS</Link>
        <nav className="hidden md:flex gap-6 font-headline tracking-tight text-sm">
          <NavLink to="/map" label="Map" />
          <NavLink to="/analytics" label="Analytics" />
          <NavLink to="/alerts" label="Alerts" />
          <NavLink to="/admin" label="Admin" />
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all"><Activity size={20} /></button>
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all"><Cloud size={20} /></button>
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all"><User size={20} /></button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={cn(
        "transition-colors font-medium",
        isActive ? "text-primary border-b-2 border-primary pb-1" : "text-outline hover:text-primary/80"
      )}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();
  
  const items = [
    { icon: Map, label: 'Live Map', path: '/map' },
    { icon: BarChart2, label: 'Intelligence', path: '/analytics' },
    { icon: Bell, label: 'Subscriptions', path: '/alerts' },
    { icon: Shield, label: 'System Health', path: '/health' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-[#0c0e11] border-r border-outline-variant/15 z-40 pt-20">
      <div className="px-6 mb-8">
        <h2 className="text-primary font-black italic font-headline uppercase tracking-widest text-xs">Resilient Goa</h2>
        <p className="text-outline text-[10px] font-medium mt-1 uppercase tracking-tight">AI Crowd Intelligence</p>
      </div>
      <nav className="flex-1 font-headline font-medium text-sm space-y-1">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "py-3 px-6 flex items-center gap-3 transition-colors",
              location.pathname === item.path 
                ? "bg-primary/10 text-primary border-l-4 border-primary" 
                : "text-outline hover:bg-surface-container-high hover:text-primary"
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-outline-variant/15">
        <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-headline font-bold text-sm shadow-lg active:scale-95 transition-all">
          Create Advisory
        </button>
      </div>
      <div className="p-4 pb-8 space-y-2 font-headline text-xs">
        <div className="text-outline flex items-center gap-3 hover:text-primary cursor-pointer transition-colors">
          <BookOpen size={14} />
          <span>Documentation</span>
        </div>
        <div className="text-outline flex items-center gap-3 hover:text-primary cursor-pointer transition-colors">
          <HelpCircle size={14} />
          <span>Support</span>
        </div>
      </div>
    </aside>
  );
}
