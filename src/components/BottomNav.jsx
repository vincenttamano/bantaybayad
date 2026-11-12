import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, PlusCircle, FileText, CreditCard } from 'lucide-react';
import useStore from '../store/useStore';
import translations from '../data/translations';

export default function BottomNav() {
  const location = useLocation();
  const { user, language } = useStore();
  const isFil = language === 'fil';

  const navItems = [
    { path: '/', icon: Home, label: isFil ? 'Home' : 'Home' },
    { path: '/dashboard', icon: FileText, label: isFil ? 'Dashboard' : 'Dashboard' },
    { path: '/create', icon: PlusCircle, label: isFil ? 'Bago' : 'New' },
    { path: '/verify', icon: Shield, label: isFil ? 'I-verify' : 'Verify' },
    { path: '/pricing', icon: CreditCard, label: isFil ? 'Presyo' : 'Plans' },
  ];

  return (
    <nav className="shrink-0 bg-surface/95 backdrop-blur-xl border-t border-border z-30 select-none" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around py-1.5 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                active
                  ? 'text-primary font-bold'
                  : 'text-text-muted hover:text-text-secondary font-medium'
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <div className={`relative ${active ? 'scale-110' : ''} transition-transform`}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                {path === '/verify' && user.verified && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-green rounded-full ring-2 ring-surface" />
                )}
              </div>
              <span className={`text-[10px] leading-tight ${active ? 'text-primary' : ''}`}>{label}</span>
            </Link>
          );
        })}
      </div>
      {/* iOS style home indicator bar */}
      <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-1.5 mt-0.5" />
    </nav>
  );
}
